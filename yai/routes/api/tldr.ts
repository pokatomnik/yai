import { FreshContext, Handlers } from "$fresh/server.ts";
import { DOMParser, type HTMLDocument } from "denodom";

const requiredRequestSchema = JSON.stringify({
  url: "string",
  token: "string",
});

const headers = (referrer?: string | null) => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Allow-Origin": "*",
  "Referrer": referrer ?? "",
} as const);

export const handler: Handlers = {
  POST: async (request: Request, _context: FreshContext): Promise<Response> => {
    let json: RequestBody | null = null;
    try {
      json = await request.json();
    } catch { /* noop */ }
    if (!json) {
      return new Response(
        JSON.stringify({ error: "INVALID_JSON", requiredRequestSchema }),
        { status: 400, headers: headers(null) },
      );
    }

    if (!json.url || !json.token) {
      return new Response(
        JSON.stringify({ error: "INVALID_PARAMS", requiredRequestSchema }),
        { status: 400, headers: headers(json.url) },
      );
    }

    let articleResponse: Response | Error | null = null;
    try {
      articleResponse = await fetch("https://300.ya.ru/api/sharing-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `OAuth ${json.token}`,
        },
        body: JSON.stringify({ article_url: json.url }),
      });
    } catch (e) {
      if (e instanceof Error) {
        articleResponse = e;
      }
    }

    if (articleResponse instanceof Error) {
      return new Response(
        JSON.stringify({
          error: "INVALID_TOKEN",
          data: articleResponse.message,
        }),
        { status: 500, headers: headers(json.url) },
      );
    }

    if (articleResponse === null) {
      return new Response(
        JSON.stringify({ error: "UNKNOWN_ERROR" }),
        { status: 500, headers: headers(json.url) },
      );
    }

    let yandexAPIREsponse: YandexAPIREsponse | Error | null = null;
    try {
      yandexAPIREsponse = await articleResponse.json();
    } catch (e) {
      if (e instanceof Error) {
        yandexAPIREsponse = e;
      }
    }

    if (yandexAPIREsponse instanceof Error) {
      return new Response(
        JSON.stringify({
          error: "INVALID_TOKEN",
          data: yandexAPIREsponse.message,
        }),
        { status: 500, headers: headers(json.url) },
      );
    }

    if (yandexAPIREsponse === null) {
      return new Response(
        JSON.stringify({ error: "UNKNOWN_ERROR" }),
        { status: 500, headers: headers(json.url) },
      );
    }

    if (yandexAPIREsponse.status !== "success") {
      return new Response(
        JSON.stringify({ error: "UNSUCCESSFUL_API_CALL" }),
        { status: 500, headers: headers(json.url) },
      );
    }

    const { sharing_url } = yandexAPIREsponse;

    let htmlResponse: Response | Error | null = null;
    try {
      htmlResponse = await fetch(sharing_url, { method: "GET" });
    } catch (e) {
      if (e instanceof Error) {
        htmlResponse = e;
      }
    }

    if (htmlResponse instanceof Error) {
      return new Response(
        JSON.stringify({
          error: "HTML_FETCH_ERROR",
          data: htmlResponse.message,
        }),
        { status: 500, headers: headers(json.url) },
      );
    }

    if (htmlResponse === null) {
      return new Response(
        JSON.stringify({ error: "HTML_FETCH_ERROR" }),
        { status: 500, headers: headers(json.url) },
      );
    }

    let html: Error | string | null = null;
    try {
      html = await htmlResponse.text();
    } catch (e) {
      if (e instanceof Error) {
        html = e;
      }
    }

    if (html === null) {
      return new Response(
        JSON.stringify({ error: "UNKNOWN_HTML_GET_ERROR" }),
        { status: 500, headers: headers(json.url) },
      );
    }

    if (html instanceof Error) {
      return new Response(
        JSON.stringify({ error: "HTML_GET_ERROR", data: html.message }),
        { status: 500, headers: headers(json.url) },
      );
    }

    const domParser = new DOMParser();
    let document: HTMLDocument | null | Error = null;
    try {
      document = domParser.parseFromString(html, "text/html");
    } catch (e) {
      if (e instanceof Error) {
        document = e;
      }
    }

    if (document instanceof Error) {
      return new Response(
        JSON.stringify({ error: "HTML_PARSE_ERROR", data: document.message }),
        { status: 500, headers: headers(json.url) },
      );
    }

    if (document === null) {
      return new Response(
        JSON.stringify({ error: "UNKNOWN_HTML_PARSE_ERROR" }),
        { status: 500, headers: headers(json.url) },
      );
    }

    const contentEl = document.querySelector("meta[name='description']");

    if (!contentEl) {
      return new Response(
        JSON.stringify({ error: "REQUIRED_ELEMETN_NOT_FOUND" }),
        { status: 500, headers: headers(json.url) },
      );
    }

    const content = contentEl.getAttribute("content");

    if (!content) {
      return new Response(
        JSON.stringify({ error: "REQUIRED_CONTENT_NOT_FOUND" }),
        { status: 500, headers: headers(json.url) },
      );
    }

    const contentItems = content.split("\n").map((item) => {
      return item.replace("•", "").trim();
    }).filter(Boolean);

    return new Response(
      JSON.stringify({ error: null, data: contentItems }),
      { status: 200, headers: headers(json.url) },
    );
  },
};

type RequestBody = Readonly<{
  url?: string;
  token?: string;
}>;

type YandexAPIResponseOK = Readonly<{
  status: "success";
  sharing_url: string;
}>;

type YandexAPIResponseFail = Readonly<{
  status: "error";
  message: string;
}>;

type YandexAPIREsponse = YandexAPIResponseOK | YandexAPIResponseFail;
