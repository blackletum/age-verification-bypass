/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

console.log("X.com bypass script is running");

// Single post view
browser.webRequest.onBeforeRequest.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);

        const filter = browser.webRequest.filterResponseData(details.requestId);

        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        let response = '';
        filter.ondata = event => {
            response += decoder.decode(event.data, { stream: true });
        };

        filter.onstop = async () => {
            try {
                let jsonData = JSON.parse(response);
                if (jsonData?.data?.tweetResult?.result?.mediaVisibilityResults) {
                    console.log("Detected NSFW post :", jsonData);
                    jsonData.data.tweetResult.result = unblurTweet(jsonData.data.tweetResult.result);
                }
                if (jsonData?.data?.tweetResult?.result?.quoted_status_result.result.mediaVisibilityResults) {
                    console.log("Detected NSFW quoted post :", jsonData);
                    jsonData.data.tweetResult.result.quoted_status_result.result = unblurTweet(jsonData.data.tweetResult.result.quoted_status_result.result);
                }
                console.log("Modified JSON data:", jsonData);
                filter.write(encoder.encode(JSON.stringify(jsonData)));
                filter.close();
            } catch (error) {
                console.warn("Data is not valid JSON:", error);
                filter.write(encoder.encode(response));
                filter.close();
            }
        }

    },
    { urls: ["https://x.com/i/api/graphql/*/TweetResultByRestId?*"] },
    ["blocking"]
);

// Single post view part 2 : Electric bogaloo

// Apparently single post pages do 2 requests and you have to change them both to bypass age checks.

browser.webRequest.onBeforeRequest.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);

        const filter = browser.webRequest.filterResponseData(details.requestId);

        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        let response = '';
        filter.ondata = event => {
            response += decoder.decode(event.data, { stream: true });
        };

        filter.onstop = async () => {
            browser.storage.local.get('twitterSetting').then((result) => {
                const twitterSetting = result['twitterSetting'];
                if (twitterSetting &&
                    twitterSetting.includes("home") && details.url.includes("HomeTimeline") ||
                    twitterSetting.includes("following") && details.url.includes("HomeLatestTimeline") ||
                    twitterSetting.includes("search") && details.url.includes("SearchTimeline") ||
                    twitterSetting.includes("bookmarks") && details.url.includes("Bookmarks") ||
                    twitterSetting.includes("profile") && (details.url.includes("UserOriginalsTimeline") || details.url.includes("UserTweetsAndReplies")) ||
                    details.url.includes("TweetDetail")
                ) {
                    try {
                        let jsonData = JSON.parse(response);
                        // Thread posts
                        jsonData?.data?.threaded_conversation_with_injections_v2?.instructions?.forEach(instruction => {
                            if (instruction?.type === "TimelineAddEntries") {
                                instruction.entries.forEach(entry => {
                                    if (entry?.content?.itemContent?.tweet_results?.result?.__typename === "TweetWithVisibilityResults") {
                                        // Remove the visibility results and set the tweet result to the tweet itself
                                        entry.content.itemContent.tweet_results.result = unblurTweet(entry.content.itemContent.tweet_results.result);
                                    }

                                    // Quoted posts
                                    if (entry?.content?.itemContent?.tweet_results?.result?.quoted_status_result?.result?.__typename === "TweetWithVisibilityResults") {
                                        entry.content.itemContent.tweet_results.result.quoted_status_result.result = unblurTweet(entry.content.itemContent.tweet_results.result.quoted_status_result.result);
                                    }

                                    // Replies in threads
                                    entry?.content?.items?.forEach(item => {
                                        if (item?.item?.itemContent?.tweet_results?.result?.__typename === "TweetWithVisibilityResults") {
                                            item.item.itemContent.tweet_results.result = unblurTweet(item.item.itemContent.tweet_results.result);
                                        }
                                    });

                                });
                            }
                        });

                        // Search results
                        jsonData?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions?.forEach(instruction => {
                            if (instruction?.type === "TimelineAddEntries") {
                                instruction.entries.forEach(entry => {
                                    if (entry?.content?.itemContent?.tweet_results?.result?.__typename === "TweetWithVisibilityResults") {
                                        // Remove the visibility results and set the tweet result to the tweet itself
                                        entry.content.itemContent.tweet_results.result = unblurTweet(entry.content.itemContent.tweet_results.result);
                                    }
                                    // Quoted posts
                                    if (entry?.content?.itemContent?.tweet_results?.result?.quoted_status_result?.result?.__typename === "TweetWithVisibilityResults") {
                                        entry.content.itemContent.tweet_results.result.quoted_status_result.result = unblurTweet(entry.content.itemContent.tweet_results.result.quoted_status_result.result);
                                    }
                                });
                            }
                        });

                        // Home & following timeline
                        jsonData?.data?.home?.home_timeline_urt?.instructions?.forEach(instruction => {
                            if (instruction?.type === "TimelineAddEntries") {
                                instruction.entries.forEach(entry => {
                                    if (entry?.content?.itemContent?.tweet_results?.result?.__typename === "TweetWithVisibilityResults") {
                                        // Remove the visibility results and set the tweet result to the tweet itself
                                        entry.content.itemContent.tweet_results.result = unblurTweet(entry.content.itemContent.tweet_results.result);
                                    }
                                    // Quoted posts
                                    if (entry?.content?.itemContent?.tweet_results?.result?.quoted_status_result?.result?.__typename === "TweetWithVisibilityResults") {
                                        entry.content.itemContent.tweet_results.result.quoted_status_result.result = unblurTweet(entry.content.itemContent.tweet_results.result.quoted_status_result.result);
                                    }
                                });
                            }
                        });

                        // Bookmarks
                        jsonData?.data?.bookmarks_timeline_v2?.timeline?.instructions?.forEach(instruction => {
                            if (instruction?.type === "TimelineAddEntries") {
                                instruction.entries.forEach(entry => {
                                    if (entry?.content?.itemContent?.tweet_results?.result?.__typename === "TweetWithVisibilityResults") {
                                        // Remove the visibility results and set the tweet result to the tweet itself
                                        entry.content.itemContent.tweet_results.result = unblurTweet(entry.content.itemContent.tweet_results.result);
                                    }
                                    // Quoted posts
                                    if (entry?.content?.itemContent?.tweet_results?.result?.quoted_status_result?.result?.__typename === "TweetWithVisibilityResults") {
                                        entry.content.itemContent.tweet_results.result.quoted_status_result.result = unblurTweet(entry.content.itemContent.tweet_results.result.quoted_status_result.result);
                                    }
                                });
                            }
                        });
                        console.log("Modified JSON data:", jsonData);
                        filter.write(encoder.encode(JSON.stringify(jsonData)));
                        filter.close();
                    } catch (error) {
                        console.warn("Data is not valid JSON:", error);
                        filter.write(encoder.encode(response));
                        filter.close();
                    }
                } else {
                    console.log("Twitter setting does not match this request, passing through unmodified.");
                    filter.write(encoder.encode(response));
                    filter.close();
                }
            })
        }

    },
    { urls: ["https://x.com/i/api/graphql/*/TweetDetail?*", "https://x.com/i/api/graphql/*/SearchTimeline?*", "https://x.com/i/api/graphql/*/HomeTimeline", "https://x.com/i/api/graphql/*/HomeLatestTimeline", "https://x.com/i/api/graphql/*/Bookmarks?*"] },
    ["blocking"]
);

// Profile pages
browser.webRequest.onBeforeRequest.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);

        const filter = browser.webRequest.filterResponseData(details.requestId);

        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        let response = '';
        filter.ondata = event => {
            response += decoder.decode(event.data, { stream: true });
        };

        filter.onstop = async () => {
            const twitterSetting = await browser.storage.local.get('twitterSetting').then((result) => result['twitterSetting']);
            if (twitterSetting && twitterSetting.includes("profile")) {
                try {
                    let jsonData = JSON.parse(response);
                    jsonData?.data?.user?.result?.timeline?.timeline?.instructions?.forEach(instruction => {
                        if (instruction?.type === "TimelineAddEntries") {
                            instruction.entries.forEach(entry => {
                                // Basic posts
                                if (entry?.content?.itemContent?.tweet_results?.result?.__typename === "TweetWithVisibilityResults") {
                                    // Remove the visibility results and set the tweet result to the tweet itself
                                    entry.content.itemContent.tweet_results.result = unblurTweet(entry.content.itemContent.tweet_results.result);
                                }

                                // Retweets
                                if (entry?.content?.items?.length > 0) {
                                    entry.content.items.forEach(item => {
                                        if (item?.item?.itemContent?.tweet_results?.result?.__typename === "TweetWithVisibilityResults") {
                                            item.item.itemContent.tweet_results.result = unblurTweet(item.item.itemContent.tweet_results.result);
                                        }
                                    });
                                }

                                // Quoted posts
                                if (entry?.content?.itemContent?.tweet_results?.result?.quoted_status_result?.result?.__typename === "TweetWithVisibilityResults") {
                                    entry.content.itemContent.tweet_results.result.quoted_status_result.result = unblurTweet(entry.content.itemContent.tweet_results.result.quoted_status_result.result);
                                }
                            });
                        }
                        if (instruction?.type === "TimelinePinEntry") {
                            // This one has a single entry instead of an array of entries
                            const entry = instruction.entry;
                            // Basic posts
                            if (entry?.content?.itemContent?.tweet_results?.result?.__typename === "TweetWithVisibilityResults") {
                                // Remove the visibility results and set the tweet result to the tweet itself
                                entry.content.itemContent.tweet_results.result = unblurTweet(entry.content.itemContent.tweet_results.result);
                            }

                            // Retweets
                            if (entry?.content?.items?.length > 0) {
                                entry.content.items.forEach(item => {
                                    if (item?.item?.itemContent?.tweet_results?.result?.__typename === "TweetWithVisibilityResults") {
                                        item.item.itemContent.tweet_results.result = unblurTweet(item.item.itemContent.tweet_results.result);
                                    }
                                });
                            }

                            // Quoted posts
                            if (entry?.content?.itemContent?.tweet_results?.result?.quoted_status_result?.result?.__typename === "TweetWithVisibilityResults") {
                                entry.content.itemContent.tweet_results.result.quoted_status_result.result = unblurTweet(entry.content.itemContent.tweet_results.result.quoted_status_result.result);
                            }
                        }
                    });
                    console.log("Modified JSON data:", jsonData);
                    filter.write(encoder.encode(JSON.stringify(jsonData)));
                    filter.close();
                } catch (error) {
                    console.warn("Data is not valid JSON:", error);
                    filter.write(encoder.encode(response));
                    filter.close();
                }
            } else {
                console.log("Twitter setting does not match this request, passing through unmodified.");
                filter.write(encoder.encode(response));
                filter.close();
            }
        }

    },
    { urls: ["https://x.com/i/api/graphql/*/UserOriginalsTimeline?*", "https://x.com/i/api/graphql/*/UserTweetsAndReplies?*"] },
    ["blocking"]
);

function unblurTweet(tweet) {
    if (tweet?.__typename === "TweetWithVisibilityResults") {
        tweet = { ...tweet.tweet };
        tweet.__typename = "Tweet";
        tweet.core.user_results.result.profile_metadata.profile_interstitial_type = "";
        tweet.legacy.possibly_sensitive = false;
        delete tweet.tweet;
    }
    return tweet;
}