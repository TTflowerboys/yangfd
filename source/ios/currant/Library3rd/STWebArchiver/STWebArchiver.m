//
// Copyright (c) 2011 Shun Takebayashi
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//

#import "STWebArchiver.h"
@interface STWebArchiver ()

- (NSArray *)extractResourcesWithHTML:(NSString *)html regex:(NSString *)regex;

- (NSArray *)absoluteURLsForPaths:(NSArray *)paths baseURL:(NSURL *)base;

@end

@implementation STWebArchiver

- (void)archiveHTMLData:(NSData *)aData
           textEncoding:(NSString *)anEncoding
                baseURL:(NSURL *)anURL
        completionBlock:(void (^)(NSData *))completion {

    NSString *htmlContent = [[NSString alloc] initWithData:aData encoding:CFStringConvertIANACharSetNameToEncoding((CFStringRef)anEncoding)];
    NSArray *pathsForImagesAndScripts = [self extractResourcesWithHTML:htmlContent regex:@"<(?:script|img).*src=[\"']((?!data:).*?)[\"']"];
    NSArray *backgroundImages = [self extractResourcesWithHTML:htmlContent regex:@"url\\([\"']((?!data:).*?)['\"]\\)"];
    NSArray *pathsForStylesheets = [self extractResourcesWithHTML:htmlContent regex:@"<link.*href=\"(.*?)\""];
    NSArray *resourcesPaths = [[pathsForImagesAndScripts arrayByAddingObjectsFromArray:pathsForStylesheets] arrayByAddingObjectsFromArray:backgroundImages];
    NSArray *resourceUrls = [self absoluteURLsForPaths:resourcesPaths baseURL:anURL];
    dispatch_async(dispatch_queue_create("Downloads", 0), ^{
        NSMutableDictionary *resources = [NSMutableDictionary dictionary];
        dispatch_apply([resourceUrls count], dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT,0), ^(size_t i) {
            NSURL *url = [resourceUrls objectAtIndex:i];
            NSString *urlString = [url absoluteString];
            BOOL unfetched = NO;
            @synchronized (resources) {
                unfetched = ![resources objectForKey:urlString];
                if (unfetched) {
                    [resources setObject:[NSNull null] forKey:urlString];
                }
            }
            if (unfetched) {
                NSURLResponse *response;
                NSError *error;
                NSURLRequest *request = [NSURLRequest requestWithURL:url];
                NSData *data = [NSURLConnection sendSynchronousRequest:request
                                                     returningResponse:&response
                                                                 error:&error];
                NSMutableDictionary *resourceArchive = [NSMutableDictionary dictionaryWithObjectsAndKeys:
                                                        urlString, @"WebResourceURL",
                                                        [response MIMEType], @"WebResourceMIMEType",
                                                        data, @"WebResourceData", nil];
                if ([response textEncodingName]) {
                    [resourceArchive setObject:[response textEncodingName] forKey:@"WebResourceTextEncodingName"];
                }
                @synchronized (resources) {
                    [resources setObject:resourceArchive forKey:urlString];
                }
            }
        });
        NSMutableDictionary *archiveSource = [NSMutableDictionary dictionaryWithObject:[resources allValues] forKey:@"WebSubresources"];
        NSMutableDictionary *mainResource = [NSMutableDictionary dictionary];
        [mainResource setObject:aData forKey:@"WebResourceData"];
        [mainResource setObject:@"" forKey:@"WebResourceFrameName"];
        [mainResource setObject:@"text/html" forKey:@"WebResourceMIMEType"];
        [mainResource setObject:anEncoding forKey:@"WebResourceTextEncodingName"];
        [mainResource setObject:[anURL absoluteString] forKey:@"WebResourceURL"];
        [archiveSource setObject:mainResource forKey:@"WebMainResource"];
        NSData *webArchive = [NSPropertyListSerialization dataFromPropertyList:archiveSource
                                                                        format:NSPropertyListBinaryFormat_v1_0
                                                              errorDescription:NULL];
        completion(webArchive);
    });
}

- (NSArray *)extractResourcesWithHTML:(NSString *)html regex:(NSString *)regex {
    NSError *error = nil;
    NSRegularExpression *exp = [NSRegularExpression regularExpressionWithPattern:regex options:NSRegularExpressionCaseInsensitive error:&error];

    NSMutableSet *resources = [NSMutableSet set];

    [exp enumerateMatchesInString:html options:0 range:NSMakeRange(0, html.length) usingBlock:^(NSTextCheckingResult * _Nullable result, NSMatchingFlags flags, BOOL * _Nonnull stop) {
        if (result && result.numberOfRanges >= 2) {
            NSString *url = [html substringWithRange:[result rangeAtIndex:1]];

            [resources addObject:url];
        }
    }];
    
    return [resources allObjects];
}

- (NSArray *)absoluteURLsForPaths:(NSArray *)paths baseURL:(NSURL *)base {
    NSMutableArray *results = [NSMutableArray arrayWithCapacity:[paths count]];
    for (NSString *path in paths) {
        NSURL *url = [NSURL URLWithString:path relativeToURL:base];
        if (url) {
            [results addObject:url];
        }
        else {
            NSLog(@"[%@|%@|%d] Bad url for base: %@ path: %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,base.absoluteString, path);
            
        }
    }
    return results;
}

@end
