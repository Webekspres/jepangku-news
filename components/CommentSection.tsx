"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import { useAuth, isAuthUser, getAuthLoginPath } from "@/contexts/AuthContext";
import { gamificationPatchFromResponse } from "@/lib/gamification-response";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  Pencil,
  Trash2,
  CornerDownRight,
  EyeOff,
  Eye,
  ShieldCheck,
  PenLine,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";
import AuthorLink from "@/components/AuthorLink";
import UserAvatar from "@/components/media/UserAvatar";

export type CommentTargetType = "ARTICLE" | "POLL" | "QUIZ" | "VIDEO";

interface CommentAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  isAdmin: boolean;
}

type CommentReaction = "THUMB_UP" | "THUMB_DOWN" | null;

interface CommentNode {
  id: string;
  parentId: string | null;
  content: string | null;
  isDeleted: boolean;
  isHidden: boolean;
  isEdited: boolean;
  isPending?: boolean;
  createdAt: string;
  author: CommentAuthor;
  thumbUp: number;
  thumbDown: number;
  userReaction: CommentReaction;
  replies: CommentNode[];
}

type PendingSubmit = {
  content: string;
  parentId: string | null;
};

const MAX_LENGTH = 1000;
const DEBOUNCE_MS = 2_000;
const PENDING_PREFIX = "pending-";

function isPendingId(id: string) {
  return id.startsWith(PENDING_PREFIX);
}

function createPendingId() {
  return `${PENDING_PREFIX}${crypto.randomUUID()}`;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "baru saja";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function findComment(nodes: CommentNode[], id: string): CommentNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const inReply = findComment(node.replies, id);
    if (inReply) return inReply;
  }
  return null;
}

function appendReply(
  nodes: CommentNode[],
  parentId: string,
  reply: CommentNode,
): CommentNode[] {
  return nodes.map((node) =>
    node.id === parentId
      ? { ...node, replies: [...node.replies, reply] }
      : { ...node, replies: appendReply(node.replies, parentId, reply) },
  );
}

function replaceComment(
  nodes: CommentNode[],
  clientId: string,
  serverComment: CommentNode,
): CommentNode[] {
  return nodes.map((node) => {
    if (node.id === clientId) return serverComment;
    return {
      ...node,
      replies: replaceComment(node.replies, clientId, serverComment),
    };
  });
}

function removeComment(nodes: CommentNode[], id: string): CommentNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => ({
      ...node,
      replies: removeComment(node.replies, id),
    }));
}

function applyReaction(
  nodes: CommentNode[],
  id: string,
  patch: Pick<CommentNode, "thumbUp" | "thumbDown" | "userReaction">,
): CommentNode[] {
  return nodes.map((node) =>
    node.id === id
      ? { ...node, ...patch }
      : { ...node, replies: applyReaction(node.replies, id, patch) },
  );
}

function syncVoteCommitted(
  nodes: CommentNode[],
  map: Map<string, CommentReaction>,
) {
  for (const node of nodes) {
    if (!isPendingId(node.id)) {
      map.set(node.id, node.userReaction);
    }
    syncVoteCommitted(node.replies, map);
  }
}

function applyOptimisticThumb(
  node: CommentNode,
  type: "THUMB_UP" | "THUMB_DOWN",
): Pick<CommentNode, "thumbUp" | "thumbDown" | "userReaction"> {
  const prev = node.userReaction;
  let thumbUp = node.thumbUp;
  let thumbDown = node.thumbDown;

  if (prev === type) {
    if (type === "THUMB_UP") thumbUp = Math.max(0, thumbUp - 1);
    else thumbDown = Math.max(0, thumbDown - 1);
    return { thumbUp, thumbDown, userReaction: null };
  }

  if (prev === "THUMB_UP") thumbUp = Math.max(0, thumbUp - 1);
  if (prev === "THUMB_DOWN") thumbDown = Math.max(0, thumbDown - 1);
  if (type === "THUMB_UP") thumbUp += 1;
  else thumbDown += 1;
  return { thumbUp, thumbDown, userReaction: type };
}

function thumbTypeToPost(
  committed: CommentReaction,
  desired: CommentReaction,
): "THUMB_UP" | "THUMB_DOWN" | null {
  if (committed === desired) return null;
  return desired ?? committed;
}

function buildOptimisticComment(
  clientId: string,
  content: string,
  parentId: string | null,
  author: CommentAuthor,
): CommentNode {
  return {
    id: clientId,
    parentId,
    content,
    isDeleted: false,
    isHidden: false,
    isEdited: false,
    isPending: true,
    createdAt: new Date().toISOString(),
    author,
    thumbUp: 0,
    thumbDown: 0,
    userReaction: null,
    replies: [],
  };
}

function Avatar({ author }: { author: CommentAuthor }) {
  return (
    <UserAvatar
      src={author.avatarUrl}
      alt={author.name}
      size={36}
      fallbackInitial={author.name}
      className="shrink-0 self-start"
    />
  );
}

export default function CommentSection({
  targetType,
  targetId,
  contentAuthorId: contentAuthorIdProp,
}: {
  targetType: CommentTargetType;
  targetId: string;
  contentAuthorId?: string | null;
}) {
  const { user, refreshUser } = useAuth();
  const authUser = isAuthUser(user) ? user : null;
  const isAdmin = authUser?.role === "ADMIN";
  const { confirm, confirmProps } = useConfirm();

  const [comments, setComments] = useState<CommentNode[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [contentAuthorId, setContentAuthorId] = useState<string | null>(
    contentAuthorIdProp ?? null,
  );

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const commentsRef = useRef(comments);
  const pendingSubmitsRef = useRef<Map<string, PendingSubmit>>(new Map());
  const commentDebounceRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const commentSyncInFlightRef = useRef<Set<string>>(new Set());
  const voteCommittedRef = useRef<Map<string, CommentReaction>>(new Map());
  const voteDebounceRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const voteSyncInFlightRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  const currentAuthor = useCallback((): CommentAuthor | null => {
    if (!authUser) return null;
    return {
      id: authUser.id,
      name: authUser.name,
      username: authUser.username,
      avatarUrl: authUser.avatarUrl,
      isAdmin,
    };
  }, [authUser, isAdmin]);

  useEffect(() => {
    if (contentAuthorIdProp) {
      setContentAuthorId(contentAuthorIdProp);
    }
  }, [contentAuthorIdProp]);

  const reloadComments = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/comments?targetType=${targetType}&targetId=${targetId}`,
      );
      const data = await parseApiResponse(res);
      const next = Array.isArray(data.comments) ? data.comments : [];
      setComments(next);
      commentsRef.current = next;
      setTotal(data.total || 0);
      if (typeof data.contentAuthorId === "string") {
        setContentAuthorId(data.contentAuthorId);
      }
      voteCommittedRef.current.clear();
      syncVoteCommitted(next, voteCommittedRef.current);
    } catch {
      // diamkan: bagian komentar tidak boleh memblok halaman
    }
  }, [targetId, targetType]);

  const load = useCallback(async () => {
    if (!initialLoadDoneRef.current) setLoading(true);
    try {
      await reloadComments();
    } finally {
      setLoading(false);
      initialLoadDoneRef.current = true;
    }
  }, [reloadComments]);

  useEffect(() => {
    load();
  }, [load]);

  const submitComment = async (content: string, parentId: string | null) => {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ targetType, targetId, content, parentId }),
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error(data.error || "Gagal mengirim komentar");
    return data;
  };

  const removePendingComment = useCallback((clientId: string) => {
    const timer = commentDebounceRef.current.get(clientId);
    if (timer) {
      clearTimeout(timer);
      commentDebounceRef.current.delete(clientId);
    }
    pendingSubmitsRef.current.delete(clientId);
    commentSyncInFlightRef.current.delete(clientId);

    const pending = findComment(commentsRef.current, clientId);
    setComments((prev) => {
      const next = removeComment(prev, clientId);
      commentsRef.current = next;
      return next;
    });
    if (pending && pending.parentId === null) {
      setTotal((value) => Math.max(0, value - 1));
    }
  }, []);

  const flushCommentSubmit = useCallback(
    async (clientId: string) => {
      const pending = pendingSubmitsRef.current.get(clientId);
      if (!pending) return;
      if (commentSyncInFlightRef.current.has(clientId)) return;

      commentSyncInFlightRef.current.add(clientId);
      try {
        const data = await submitComment(pending.content, pending.parentId);
        const serverComment = data.comment as CommentNode;
        setComments((prev) => {
          const next = replaceComment(prev, clientId, {
            ...serverComment,
            isPending: false,
          });
          commentsRef.current = next;
          return next;
        });
        voteCommittedRef.current.set(serverComment.id, null);
        pendingSubmitsRef.current.delete(clientId);

        if (data.pointsAwarded) {
          toast.success(`Komentar terkirim! +${data.points} poin`);
          await refreshUser(gamificationPatchFromResponse(data));
        }
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Gagal mengirim komentar";
        toast.error(message);
        removePendingComment(clientId);
      } finally {
        commentSyncInFlightRef.current.delete(clientId);
      }
    },
    [refreshUser, removePendingComment, targetId, targetType],
  );

  const scheduleCommentSubmit = useCallback(
    (clientId: string) => {
      const existing = commentDebounceRef.current.get(clientId);
      if (existing) clearTimeout(existing);
      commentDebounceRef.current.set(
        clientId,
        setTimeout(() => {
          commentDebounceRef.current.delete(clientId);
          void flushCommentSubmit(clientId);
        }, DEBOUNCE_MS),
      );
    },
    [flushCommentSubmit],
  );

  const queueOptimisticComment = useCallback(
    (content: string, parentId: string | null) => {
      const author = currentAuthor();
      if (!author) return;

      const clientId = createPendingId();
      const optimistic = buildOptimisticComment(
        clientId,
        content,
        parentId,
        author,
      );

      setComments((prev) => {
        const next = parentId
          ? appendReply(prev, parentId, optimistic)
          : [...prev, optimistic];
        commentsRef.current = next;
        return next;
      });
      if (parentId === null) {
        setTotal((value) => value + 1);
      }

      pendingSubmitsRef.current.set(clientId, { content, parentId });
      scheduleCommentSubmit(clientId);
    },
    [currentAuthor, scheduleCommentSubmit],
  );

  const handleCreate = () => {
    if (!authUser) {
      toast.error("Silakan masuk untuk berkomentar");
      return;
    }
    const content = newComment.trim();
    if (!content) return;
    setNewComment("");
    queueOptimisticComment(content, null);
  };

  const handleReply = (parentId: string) => {
    if (isPendingId(parentId)) return;
    const content = replyText.trim();
    if (!content) return;
    setReplyTo(null);
    setReplyText("");
    queueOptimisticComment(content, parentId);
  };

  const handleEdit = async (id: string) => {
    if (isPendingId(id)) return;
    const content = editText.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      const data = await parseApiResponse(res);
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setEditingId(null);
      setEditText("");
      await reloadComments();
      toast.success("Komentar diperbarui");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal menyimpan";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (isPendingId(id)) {
      removePendingComment(id);
      return;
    }

    confirm({
      title: "Hapus komentar?",
      description: "Komentar yang dihapus tidak dapat dikembalikan.",
      confirmLabel: "Hapus",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/comments/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) {
            const d = await parseApiResponse(res);
            throw new Error(d.error);
          }
          await reloadComments();
          toast.success("Komentar dihapus");
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : "Gagal menghapus";
          toast.error(message);
        }
      },
    });
  };

  const handleModerate = async (id: string, action: "hide" | "unhide") => {
    if (isPendingId(id)) return;
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const d = await parseApiResponse(res);
        throw new Error(d.error);
      }
      await reloadComments();
      toast.success(
        action === "hide" ? "Komentar disembunyikan" : "Komentar ditampilkan",
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal memoderasi";
      toast.error(message);
    }
  };

  const flushVote = useCallback(
    async (commentId: string) => {
      if (isPendingId(commentId)) return;

      const node = findComment(commentsRef.current, commentId);
      if (!node) return;

      const desired = node.userReaction;
      const committed = voteCommittedRef.current.get(commentId) ?? null;
      const typeToPost = thumbTypeToPost(committed, desired);
      if (!typeToPost) return;
      if (voteSyncInFlightRef.current.has(commentId)) return;

      voteSyncInFlightRef.current.add(commentId);
      try {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            targetType: "COMMENT",
            targetId: commentId,
            type: typeToPost,
          }),
        });
        const data = await parseApiResponse(res);
        if (!res.ok) throw new Error(data.error || "Gagal menyimpan reaksi");

        const synced = {
          thumbUp: data.counts?.THUMB_UP || 0,
          thumbDown: data.counts?.THUMB_DOWN || 0,
          userReaction: (data.userReaction as CommentReaction) || null,
        };
        setComments((prev) => {
          const next = applyReaction(prev, commentId, synced);
          commentsRef.current = next;
          return next;
        });
        voteCommittedRef.current.set(commentId, synced.userReaction);
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Gagal menyimpan reaksi";
        toast.error(message);
        await reloadComments();
      } finally {
        voteSyncInFlightRef.current.delete(commentId);
        const current = findComment(commentsRef.current, commentId);
        if (
          current &&
          current.userReaction !== voteCommittedRef.current.get(commentId)
        ) {
          queueMicrotask(() => void flushVote(commentId));
        }
      }
    },
    [reloadComments],
  );

  const scheduleVoteSync = useCallback(
    (commentId: string) => {
      const existing = voteDebounceRef.current.get(commentId);
      if (existing) clearTimeout(existing);
      voteDebounceRef.current.set(
        commentId,
        setTimeout(() => {
          voteDebounceRef.current.delete(commentId);
          void flushVote(commentId);
        }, DEBOUNCE_MS),
      );
    },
    [flushVote],
  );

  const handleVote = (id: string, type: "THUMB_UP" | "THUMB_DOWN") => {
    if (!authUser) {
      toast.error("Silakan masuk untuk memberi reaksi");
      return;
    }
    if (isPendingId(id)) return;

    const node = findComment(commentsRef.current, id);
    if (!node) return;

    const patch = applyOptimisticThumb(node, type);
    setComments((prev) => {
      const next = applyReaction(prev, id, patch);
      commentsRef.current = next;
      return next;
    });
    scheduleVoteSync(id);
  };

  useEffect(() => {
    return () => {
      for (const timer of commentDebounceRef.current.values()) {
        clearTimeout(timer);
      }
      commentDebounceRef.current.clear();

      for (const [clientId] of pendingSubmitsRef.current) {
        void flushCommentSubmit(clientId);
      }

      for (const timer of voteDebounceRef.current.values()) {
        clearTimeout(timer);
      }
      voteDebounceRef.current.clear();

      for (const commentId of voteCommittedRef.current.keys()) {
        const committed = voteCommittedRef.current.get(commentId) ?? null;
        const node = findComment(commentsRef.current, commentId);
        if (!node) continue;
        const desired = node.userReaction;
        const typeToPost = thumbTypeToPost(committed, desired);
        if (!typeToPost) continue;
        void fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          keepalive: true,
          body: JSON.stringify({
            targetType: "COMMENT",
            targetId: commentId,
            type: typeToPost,
          }),
        });
      }
    };
  }, [flushCommentSubmit]);

  const renderComment = (c: CommentNode, isReply = false) => {
    const isOwner = authUser?.id === c.author.id;
    const isContentAuthor =
      Boolean(contentAuthorId) && c.author.id === contentAuthorId;
    const placeholder = c.isDeleted
      ? "[Komentar ini telah dihapus]"
      : c.isHidden
        ? "[Komentar disembunyikan oleh moderator]"
        : null;
    const isEditing = editingId === c.id;

    return (
      <div
        key={c.id}
        className={cn(
          "flex items-start gap-3",
          isReply && "mt-4",
          c.isPending && "opacity-90",
        )}
        data-testid={`comment-${c.id}`}
        id={`comment-${c.id}`}
      >
        <Avatar author={c.author} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <AuthorLink username={c.author.username} className="font-semibold text-sm">
              {c.author.name}
            </AuthorLink>
            {c.author.isAdmin && (
              <Badge variant="red" className="text-[9px] px-1.5 py-0">
                <ShieldCheck size={9} className="mr-0.5" /> ADMIN
              </Badge>
            )}
            {isContentAuthor && (
              <Badge
                variant="outline"
                className="border-jepang-red text-jepang-red text-[9px] px-1.5 py-0"
                data-testid={`comment-author-badge-${c.id}`}
              >
                <PenLine size={9} className="mr-0.5" /> PENULIS
              </Badge>
            )}
            <span className="text-[11px] font-mono uppercase tracking-wider text-jepang-muted">
              {relativeTime(c.createdAt)}
              {c.isEdited && !placeholder ? " · disunting" : ""}
              {c.isPending ? " · mengirim" : ""}
            </span>
          </div>

          {placeholder ? (
            <p className="mt-1 text-sm italic text-jepang-muted">{placeholder}</p>
          ) : isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value.slice(0, MAX_LENGTH))}
                rows={3}
                data-testid="comment-edit-input"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleEdit(c.id)}
                  disabled={submitting || !editText.trim()}
                >
                  Simpan
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setEditText("");
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
              {c.content}
            </p>
          )}

          {!placeholder && !isEditing && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-wider">
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 hover:text-jepang-red",
                  c.userReaction === "THUMB_UP"
                    ? "text-jepang-red"
                    : "text-jepang-muted",
                  c.isPending && "pointer-events-none opacity-50",
                )}
                onClick={() => handleVote(c.id, "THUMB_UP")}
                disabled={c.isPending}
                data-testid={`thumbup-btn-${c.id}`}
              >
                <ThumbsUp size={12} /> {c.thumbUp}
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 hover:text-foreground",
                  c.userReaction === "THUMB_DOWN"
                    ? "text-foreground"
                    : "text-jepang-muted",
                  c.isPending && "pointer-events-none opacity-50",
                )}
                onClick={() => handleVote(c.id, "THUMB_DOWN")}
                disabled={c.isPending}
                data-testid={`thumbdown-btn-${c.id}`}
              >
                <ThumbsDown size={12} /> {c.thumbDown}
              </button>
              {!isReply && authUser && !c.isPending && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-jepang-muted hover:text-jepang-red"
                  onClick={() => {
                    setReplyTo(replyTo === c.id ? null : c.id);
                    setReplyText("");
                  }}
                  data-testid={`reply-btn-${c.id}`}
                >
                  <CornerDownRight size={12} /> Balas
                </button>
              )}
              {isOwner && !c.isPending && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-jepang-muted hover:text-foreground"
                  onClick={() => {
                    setEditingId(c.id);
                    setEditText(c.content || "");
                  }}
                  data-testid={`edit-btn-${c.id}`}
                >
                  <Pencil size={12} /> Edit
                </button>
              )}
              {(isOwner || isAdmin) && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-jepang-muted hover:text-jepang-red"
                  onClick={() => handleDelete(c.id)}
                  data-testid={`delete-btn-${c.id}`}
                >
                  <Trash2 size={12} /> Hapus
                </button>
              )}
              {isAdmin && !c.isPending && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-jepang-muted hover:text-foreground"
                  onClick={() => handleModerate(c.id, c.isHidden ? "unhide" : "hide")}
                  data-testid={`moderate-btn-${c.id}`}
                >
                  {c.isHidden ? (
                    <>
                      <Eye size={12} /> Tampilkan
                    </>
                  ) : (
                    <>
                      <EyeOff size={12} /> Sembunyikan
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {replyTo === c.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value.slice(0, MAX_LENGTH))}
                placeholder={`Balas ${c.author.name}...`}
                rows={2}
                data-testid={`reply-input-${c.id}`}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleReply(c.id)}
                  disabled={!replyText.trim()}
                >
                  <Send size={12} /> Kirim
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyText("");
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}

          {c.replies.length > 0 && (
            <div className="mt-3 border-l-2 border-jepang-border pl-4">
              {c.replies.map((r) => renderComment(r, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const showSkeleton = loading && comments.length === 0;

  return (
    <section
      className="mt-12 pt-8 border-t-2 border-foreground"
      data-testid="comment-section"
    >
      <ConfirmModal {...confirmProps} />

      <h2 className="font-heading font-black text-2xl tracking-tighter mb-6 flex items-center gap-2">
        <MessageSquare size={24} strokeWidth={1.5} />
        Komentar
        <span className="text-jepang-red">({total})</span>
      </h2>

      {authUser ? (
        <div className="mb-8 flex items-start gap-3">
          <Avatar
            author={{
              id: authUser.id,
              name: authUser.name,
              username: authUser.username,
              avatarUrl: authUser.avatarUrl,
              isAdmin,
            }}
          />
          <div className="flex-1 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value.slice(0, MAX_LENGTH))}
              placeholder="Tulis komentar..."
              rows={3}
              data-testid="comment-input"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-jepang-muted">
                {newComment.length}/{MAX_LENGTH}
              </span>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newComment.trim()}
                data-testid="comment-submit"
              >
                <Send size={12} /> Kirim Komentar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 border border-jepang-border p-4 text-center">
          <Link href={getAuthLoginPath()} className="text-jepang-red font-bold text-sm">
            MASUK UNTUK BERKOMENTAR DAN DAPATKAN POIN
          </Link>
        </div>
      )}

      {showSkeleton ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-9 w-9 shrink-0 rounded-full bg-jepang-border" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-jepang-border" />
                <div className="h-3 w-full bg-jepang-border" />
                <div className="h-3 w-2/3 bg-jepang-border" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-jepang-muted text-sm py-8 text-center" data-testid="no-comments">
          Belum ada komentar. Jadilah yang pertama!
        </p>
      ) : (
        <div className="space-y-6" data-testid="comment-list">
          {comments.map((c) => renderComment(c))}
        </div>
      )}
    </section>
  );
}
