import BookmarkletGenerator from "islands/BookmarkletGenerator.tsx";

export default function Home() {
  return (
    <div class="absolute left-0 right-0 top-0 bottom-0 overflow-hidden flex flex-1 justify-center items-center flex-col">
      <BookmarkletGenerator />
    </div>
  );
}
