import { useComputed, useSignal } from "@preact/signals";

export default function BookmarkletGenerator() {
  const tokenState = useSignal("");
  const bookmarkletTextState = useComputed(() => {
    return getBookmarklet(
      `${getOrigin()}/api/tldr`,
      tokenState.value,
    );
  });

  const handleClick = () => {
    if (tokenState.value) {
      navigator.clipboard.writeText(bookmarkletTextState.value);
    } else {
      alert("Specify token");
    }
  };

  return (
    <div className="flex flex-col basis-1/2 pr-6 pl-6 w-full sm:w-full md:w-full lg:w-3/4 xl:w-1/2 2xl:w-1/2">
      <h1 className="text-2xl font-bold flex text-center mb-4">
        Yandex summarization bookmarklet creator
      </h1>
      <label className="flex flex-col mb-4">
        <h2 className="text-xl font-bold">Yandex API token</h2>
        <input
          autofocus
          autocomplete="off"
          autoComplete="off"
          placeholder="y0_AgAAAAAJ5_jUY7Plnry64Jn8djaksmasnfkal9375Nalkfdnflanfsk"
          className="border-2 border-gray-600 p-2 rounded-xl"
          value={tokenState}
          onInput={(e) => {
            tokenState.value = e.currentTarget.value;
          }}
        />
      </label>
      <label className="flex flex-col mb-4">
        <h2 className="text-xl font-bold">Bookmarklet</h2>
        <textarea
          readonly
          value={bookmarkletTextState.value}
          className="resize-none border-2 border-gray-600 p-2 rounded-xl h-40"
          onFocus={(e) => {
            e.currentTarget.select();
          }}
        />
      </label>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleClick}
          className="p-2 rounded-xl bg-gray-600 active:bg-gray-700 pt-2 pl-4 pb-2 pr-4 text-white"
        >
          COPY
        </button>
      </div>
    </div>
  );
}

const getBookmarklet = (apiUrl: string, token: string) => {
  const js = `
    (function (apiUrl, token) {
      fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({ url: window.location.toString(), token }),
      })
        .then((res) => res.json())
        .then((res) => alert(res.data.join("\\n")))
        .catch((e) => alert(e.message));
    })("${apiUrl}", "${token}");
    `.trim().replace(/\n/g, "");
  let updated = js;
  do {
    const newUpdated = updated.replace("  ", " ");
    if (newUpdated === updated) break;
    updated = newUpdated;
  } while (true);
  return `javascript:${updated}`;
};

function getOrigin() {
  try {
    return window.location.origin;
  } catch {
    return "";
  }
}
