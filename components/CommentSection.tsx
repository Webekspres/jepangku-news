"use client";

import { useCallback, useEffect, useState } from "react";
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
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";
import AuthorLink from "@/components/AuthorLink";

export type CommentTargetType = "ARTICLE" | "POLL" | "QUIZ";

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
  createdAt: string;
  author: CommentAuthor;
  thumbUp: number;
  thumbDown: number;
  userReaction: CommentReaction;
  replies: CommentNode[];
}

const MAX_LENGTH = 1000;

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

function Avatar({ author }: { author: CommentAuthor }) {
  if (author.avatarUrl) {
    return (
      <img
        src={author.avatarUrl}
        alt={author.name}
        className="h-9 w-9 border border-foreground object-cover shrink-0"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-foreground bg-foreground text-sm font-bold text-white">
      {author.name?.charAt(0).toUpperCase() || "?"}
    </div>
  );
}

export default function CommentSection({
  targetType,
  targetId,
}: {
  targetType: CommentTargetType;
  targetId: string;
}) {
  const { user, refreshUser } = useAuth();
  const authUser = isAuthUser(user) ? user : null;
  const isAdmin = authUser?.role === "ADMIN";
  const { confirm, confirmProps } = useConfirm();

  const [comments, setComments] = useState<CommentNode[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/comments?targetType=${targetType}&targetId=${targetId}`,
      );
      const data = await res.json();
      setComments(Array.isArray(data.comments) ? data.comments : []);
      setTotal(data.total || 0);
    } catch {
      // diamkan: bagian komentar tidak boleh memblok halaman
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal mengirim komentar");
    return data;
  };

  const handleCreate = async () => {
    if (!authUser) {
      toast.error("Silakan masuk untuk berkomentar");
      return;
    }
    const content = newComment.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      const data = await submitComment(content, null);
      setNewComment("");
      await load();
      if (data.pointsAwarded) {
        toast.success(`Komentar terkirim! +${data.points} poin`);
        await refreshUser(gamificationPatchFromResponse(data));
      } else {
        toast.success("Komentar terkirim");
      }
    } catch (e: any) {
      toast.error(e.message || "Gagal mengirim komentar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    const content = replyText.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      const data = await submitComment(content, parentId);
      setReplyTo(null);
      setReplyText("");
      await load();
      if (data.pointsAwarded) {
        toast.success(`Balasan terkirim! +${data.points} poin`);
        await refreshUser(gamificationPatchFromResponse(data));
      } else {
        toast.success("Balasan terkirim");
      }
    } catch (e: any) {
      toast.error(e.message || "Gagal mengirim balasan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id: string) => {
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setEditingId(null);
      setEditText("");
      await load();
      toast.success("Komentar diperbarui");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
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
            const d = await res.json();
            throw new Error(d.error);
          }
          await load();
          toast.success("Komentar dihapus");
        } catch (e: any) {
          toast.error(e.message || "Gagal menghapus");
        }
      },
    });
  };

  const handleModerate = async (id: string, action: "hide" | "unhide") => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      await load();
      toast.success(action === "hide" ? "Komentar disembunyikan" : "Komentar ditampilkan");
    } catch (e: any) {
      toast.error(e.message || "Gagal memoderasi");
    }
  };

  const [votingId, setVotingId] = useState<string | null>(null);

  const applyReaction = (
    nodes: CommentNode[],
    id: string,
    patch: Pick<CommentNode, "thumbUp" | "thumbDown" | "userReaction">,
  ): CommentNode[] =>
    nodes.map((n) =>
      n.id === id
        ? { ...n, ...patch }
        : { ...n, replies: applyReaction(n.replies, id, patch) },
    );

  const handleVote = async (id: string, type: "THUMB_UP" | "THUMB_DOWN") => {
    if (!authUser) {
      toast.error("Silakan masuk untuk memberi reaksi");
      return;
    }
    if (votingId) return;
    setVotingId(id);
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetType: "COMMENT", targetId: id, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan reaksi");
      setComments((prev) =>
        applyReaction(prev, id, {
          thumbUp: data.counts?.THUMB_UP || 0,
          thumbDown: data.counts?.THUMB_DOWN || 0,
          userReaction: (data.userReaction as CommentReaction) || null,
        }),
      );
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan reaksi");
    } finally {
      setVotingId(null);
    }
  };

  const renderComment = (c: CommentNode, isReply = false) => {
    const isOwner = authUser?.id === c.author.id;
    const placeholder = c.isDeleted
      ? "[Komentar ini telah dihapus]"
      : c.isHidden
        ? "[Komentar disembunyikan oleh moderator]"
        : null;
    const isEditing = editingId === c.id;

    return (
      <div
        key={c.id}
        className={cn("flex gap-3", isReply && "mt-4")}
        data-testid={`comment-${c.id}`}
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
            <span className="text-[11px] font-mono uppercase tracking-wider text-jepang-muted">
              {relativeTime(c.createdAt)}
              {c.isEdited && !placeholder ? " · disunting" : ""}
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

          {/* Aksi */}
          {!placeholder && !isEditing && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-wider">
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 hover:text-jepang-red disabled:opacity-50",
                  c.userReaction === "THUMB_UP"
                    ? "text-jepang-red"
                    : "text-jepang-muted",
                )}
                onClick={() => handleVote(c.id, "THUMB_UP")}
                disabled={votingId === c.id}
                data-testid={`thumbup-btn-${c.id}`}
              >
                <ThumbsUp size={12} /> {c.thumbUp}
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 hover:text-foreground disabled:opacity-50",
                  c.userReaction === "THUMB_DOWN"
                    ? "text-foreground"
                    : "text-jepang-muted",
                )}
                onClick={() => handleVote(c.id, "THUMB_DOWN")}
                disabled={votingId === c.id}
                data-testid={`thumbdown-btn-${c.id}`}
              >
                <ThumbsDown size={12} /> {c.thumbDown}
              </button>
              {!isReply && authUser && (
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
              {isOwner && (
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
              {isAdmin && (
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

          {/* Form balasan */}
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
                  disabled={submitting || !replyText.trim()}
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

          {/* Balasan */}
          {c.replies.length > 0 && (
            <div className="mt-3 border-l-2 border-jepang-border pl-4">
              {c.replies.map((r) => renderComment(r, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

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

      {/* Form komentar baru */}
      {authUser ? (
        <div className="mb-8 flex gap-3">
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
                disabled={submitting || !newComment.trim()}
                data-testid="comment-submit"
              >
                <Send size={12} /> {submitting ? "Mengirim..." : "Kirim Komentar"}
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

      {/* Daftar komentar */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-9 w-9 bg-jepang-border shrink-0" />
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
