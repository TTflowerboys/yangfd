//
//  CUTEWebArchiver.m
//  currant
//
//  Created by Foster Yin on 8/31/15.
//  Copyright © 2015 Foster Yin. All rights reserved.
//

#import "CUTEWebArchiveManager.h"
#import "STWebArchiver.h"
#import <EGOCache.h>
#import <EXTKeyPathCoding.h>
#import "CUTEUserAgentUtil.h"

@implementation CUTEWebArchive

- (id)initWithCoder:(NSCoder *)aDecoder {
    self = [super init];
    if (self) {
        self.data = [aDecoder decodeObjectForKey:@keypath(self.data)];
        self.textEncodingName = [aDecoder decodeObjectForKey:@keypath(self.textEncodingName)];
        self.MIMEType = [aDecoder decodeObjectForKey:@keypath(self.MIMEType)];
        self.URL = [aDecoder decodeObjectForKey:@keypath(self.URL)];
    }
    return self;
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
    [aCoder encodeObject:self.data forKey:@keypath(self.data)];
    [aCoder encodeObject:self.textEncodingName forKey:@keypath(self.textEncodingName)];
    [aCoder encodeObject:self.MIMEType forKey:@keypath(self.MIMEType)];
    [aCoder encodeObject:self.URL forKey:@keypath(self.URL)];

}

@end


@interface CUTEWebArchiveManager () {

    EGOCache *_cache;

    NSURLSession *_downloadSession;

}

@end

@implementation CUTEWebArchiveManager

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
    });

    return sharedInstance;
}

- (instancetype)init
{
    self = [super init];
    if (self) {
        NSString* cachesDirectory = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES)[0];
        cachesDirectory = [[[cachesDirectory stringByAppendingPathComponent:[[NSBundle mainBundle] bundleIdentifier]] stringByAppendingPathComponent:@"WebArchiveCache"] copy];
        _cache = [[EGOCache alloc] initWithCacheDirectory:cachesDirectory];
        NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
        configuration.HTTPAdditionalHeaders = @{@"User-Agent":[CUTEUserAgentUtil userAgent]};
        _downloadSession = [NSURLSession sessionWithConfiguration:configuration];
    }
    return self;
}

- (void)archiveURL:(NSURL *)url {
    [[_downloadSession dataTaskWithURL:url completionHandler:^(NSData *data, NSURLResponse *response, NSError *  error) {
        if (data && data.length && response.URL) {
            if ([response isKindOfClass:[NSHTTPURLResponse class]]) {
                NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
                if (httpResponse.statusCode == 200) {
                    NSString *encodingName = response.textEncodingName? response.textEncodingName: @"utf-8";
                    STWebArchiver *archiver = [[STWebArchiver alloc] init];
                    [archiver archiveHTMLData:data textEncoding:encodingName baseURL:response.URL completionBlock:^(id propertyList) {
                        CUTEWebArchive *archive = [CUTEWebArchive new];
                        archive.data = propertyList;
                        archive.URL = response.URL;
                        archive.MIMEType = @"application/x-webarchive";
                        archive.textEncodingName = encodingName;
                        [_cache setObject:archive forKey:response.URL.absoluteString];
                    }];
                }
            }
        }
    }] resume];
}

- (CUTEWebArchive *)getWebArchiveWithURL:(NSURL *)url {
    return (CUTEWebArchive *)[_cache objectForKey:url.absoluteString];
}

- (void)clear {
    [_cache clearCache];
}

@end
