import { PostComposer } from "@/components/PostComposer";
import { FeedList } from "@/components/FeedList";

export default function FeedPage() {
  return (
    <main>
      <div className="border-b border-ink-700 px-5 py-3">
        <h1 className="font-display text-lg font-bold text-mist-100">Feed</h1>
      </div>
      <PostComposer />
      <FeedList />
    </main>
  );
}
