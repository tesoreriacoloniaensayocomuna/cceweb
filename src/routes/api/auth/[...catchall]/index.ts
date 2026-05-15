import type { RequestHandler } from "@builder.io/qwik-city";
import { getAuth } from "../../../../lib/auth";

export const onGet: RequestHandler = async (event) => {
    const response = await getAuth(event.env).handler(event.request);
    event.send(response);
};

export const onPost: RequestHandler = async (event) => {
    const response = await getAuth(event.env).handler(event.request);
    event.send(response);
};
