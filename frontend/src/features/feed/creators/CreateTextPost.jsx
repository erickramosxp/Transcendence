import { Send } from "lucide-react";
import { createPortal } from "react-dom";
import EmojiPicker from "emoji-picker-react";
import { useCreatePost } from "./useCreatePost";
import { useFloatingEmojiPicker } from "@/features/feed/hooks/useFloatingEmojiPicker";

import { Button, Textarea, Card, CardContent } from "@/design-system";

function CreateTextPost({ onAddPost, onClose }) {
  const {
    text,
    error,
    showEmojiPicker,
    handleSubmit,
    handleChange,
    handleEmojiSelect,
    linkPreview,
    linkPreviewLoading,
    linkPreviewError,
  } = useCreatePost(onAddPost, onClose, "text");

  const { anchorRef, pickerStyle } = useFloatingEmojiPicker(showEmojiPicker);

  return (
    <Card className="mx-auto w-full max-w-[520px] border-border bg-card/90 backdrop-blur-xl shadow-xl">
      <CardContent className="p-4 sm:p-6">
        <div className="flex gap-3 sm:gap-4">
          <div className="relative min-w-0 flex-1 space-y-3 sm:space-y-4">
            <div ref={anchorRef}>

            <Textarea
              maxLength={500}
              value={text}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="O que você está pensando?"
              className="min-h-[80px] resize-none sm:min-h-[100px]"
              />
              </div>

            {linkPreview && (
              <div className="mt-2 rounded-lg border border-border bg-muted p-3">
                <div className="flex items-center gap-3">
                  {linkPreview.image && (
                    <img
                      src={linkPreview.image}
                      alt={linkPreview.title}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-foreground">
                      {linkPreview.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {linkPreview.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-right text-sm text-muted-foreground">
              {text.length}/500
            </p>

            {showEmojiPicker &&
              createPortal(
                <div
                  className="fixed z-[100]"
                  style={{
                    top: `${pickerStyle.top}px`,
                    left: `${pickerStyle.left}px`,
                  }}
                >
                  <EmojiPicker onEmojiClick={handleEmojiSelect} />
                </div>,
                document.body
              )}

            <div className="flex items-center justify-end gap-2">
              <Button onClick={handleSubmit} variant="primary" size="sm">
                <Send className="mr-2 h-4 w-4" />
                Postar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreateTextPost;