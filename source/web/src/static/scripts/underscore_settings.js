/* Created by frank on 14/10/21. */
_.templateSettings = {
    evaluate: /{_([\s\S]+?)_}/g,
    interpolate: /{!([\s\S]+?)!}/g,
    escape: /{=([\s\S]+?)=}/g
}
