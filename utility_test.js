import * as utility from "./utility.js";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("getURLParam", () => {
	assertEquals(
		utility.getUrlParam("https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_is_a_URL"),
		{
			"schema": "https",
			"domain": "developer.mozilla.org",
			"port": undefined,
			"path": "/en-US/docs/Learn/Common_questions/What_is_a_URL",
			"query": {}
		});
	assertEquals(
		utility.getUrlParam("http://localhost:20680/src/index.html"),
		{
			"schema": "http",
			"domain": "localhost",
			"port": "20680",
			"path": "/src/index.html",
			"query": {}
		});
	assertEquals(
		utility.getUrlParam("https://github.com/denoland/deno/issues?page=20&q=is%3Aissue+is%3Aopen"),
		{
			"schema": "https",
			"domain": "github.com",
			"port": undefined,
			"path": "/denoland/deno/issues",
			"query": {
				"page": "20",
				"q": "is:issue+is:open"
			}
		});
	assertEquals(
		utility.getUrlParam("/denoland/deno/issues?page=20&q=is%3Aissue+is%3Aopen"),
		{
			"schema": undefined,
			"domain": undefined,
			"port": undefined,
			"path": "/denoland/deno/issues",
			"query": {
				"page": "20",
				"q": "is:issue+is:open"
			}
		});
});