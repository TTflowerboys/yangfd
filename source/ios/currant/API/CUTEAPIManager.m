//
//  CUTEAPIManager.m
//  currant
//
//  Created by Foster Yin on 4/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEAPIManager.h"
#import <BBTRestClient.h>
#import "CUTEConfiguration.h"
#import "CUTECommonMacro.h"

@interface CUTEAPIManager () {

    BBTRestClient *_backingManager;
}

@end

@implementation CUTEAPIManager

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
        _backingManager = [BBTRestClient clientWithBaseURL:[NSURL URLWithString:[CUTEConfiguration apiEndpoint]] account:nil];
        _backingManager.requestSerializer = [[AFJSONRequestSerializer alloc] init];
        [_backingManager.requestSerializer setValue:@"application/json" forHTTPHeaderField:@"Accept"];
        [_backingManager.requestSerializer setValue:@"gzip" forHTTPHeaderField:@"Content-Encoding"];
        [_backingManager.requestSerializer setValue:@"gzip" forHTTPHeaderField:@"Accept-Encoding"];
    }
    return self;
}

- (BFTask *)GET:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass  {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    [_backingManager GET:URLString parameters:parameters resultClass:resultClass completion:
     ^(AFHTTPRequestOperation *operation, id responseObject, NSError *error) {
         if (error) {
             [tcs setError:error];
         }
         else {
             [tcs setResult:responseObject];
         }
     }];
    return tcs.task;
}

- (BFTask *)POST:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass  {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    [_backingManager POST:URLString parameters:parameters resultClass:resultClass completion:
     ^(AFHTTPRequestOperation *operation, id responseObject, NSError *error) {
         if (error) {
             [tcs setError:error];
         }
         else {
             [tcs setResult:responseObject];
         }
     }];
    return tcs.task;
}


@end
