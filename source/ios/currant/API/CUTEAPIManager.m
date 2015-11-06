//
//  CUTEAPIManager.m
//  currant
//
//  Created by Foster Yin on 4/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEAPIManager.h"
#import <BBTRestClient.h>
#import <UIImageView+AFNetworking.h>
#import <NSArray+ObjectiveSugar.h>
#import <RegExCategories.h>
#import "CUTEConfiguration.h"
#import "CUTECommonMacro.h"
#import "CUTEUserAgentUtil.h"
#import <currant-Swift.h>


@interface CUTEAPIManager () {

    BBTRestClient *_backingManager;

    UIImageView *_imageDownloader;

    NSMutableDictionary *_adapterURLRuleMappings;
}

@property (nonatomic, readonly) BBTRestClient *backingManager;

@end

@implementation CUTEAPIManager

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];

        // 1. /api/1/property/<property_id>
        // 2. /api/1/property/search
        // 3. /api/1/property/<property_id>/edit
        [sharedInstance registerAPIProxyClassName:@"CUTEPropertyAPIProxy" withURLRule:@"/api/1/property/*+"];
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
        [_backingManager.requestSerializer setValue:[CUTEUserAgentUtil userAgent] forHTTPHeaderField:@"User-Agent"];

        _imageDownloader = [UIImageView new];

        _adapterURLRuleMappings = [NSMutableDictionary dictionary];
    }
    return self;
}

- (BBTRestClient *)backingManager {
    return _backingManager;
}

- (void)registerAPIProxyClassName:(NSString *)className withURLRule:(NSString *)rule {
    NSAssert([NSClassFromString(className) conformsToProtocol:@protocol(CUTEAPIProxyProtocol)], @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,@"");

    [_adapterURLRuleMappings setObject:className forKey:rule];
}

- (id<CUTEAPIProxyProtocol>)getAPIProxyWithURLString:(NSString *)URLString {
    NSString* rule = [_adapterURLRuleMappings.allKeys find:^BOOL(NSString* key) {
        return [RX(key) isMatch:URLString];
    }];
    if (rule) {
        NSString  *className = [_adapterURLRuleMappings objectForKey:rule];
        id<CUTEAPIProxyProtocol> adapter = [[NSClassFromString(className) alloc] init];
        [adapter setRestClient:_backingManager];
        return adapter;

    }

    return nil;
}

- (BFTask *)GET:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass  {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    id<CUTEAPIProxyProtocol> apiProxy = [self getAPIProxyWithURLString:URLString];
    if (apiProxy != nil) {
        return [apiProxy GET:URLString parameters:parameters resultClass:resultClass];
    }


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

- (BFTask *)GET:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    id<CUTEAPIProxyProtocol> apiProxy = [self getAPIProxyWithURLString:URLString];
    if (apiProxy != nil) {
        return [apiProxy GET:URLString parameters:parameters resultClass:resultClass resultKeyPath:keyPath];
    }


    [_backingManager GET:URLString parameters:parameters resultClass:resultClass resultKeyPath:keyPath completion:
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
    id<CUTEAPIProxyProtocol> apiProxy = [self getAPIProxyWithURLString:URLString];
    if (apiProxy != nil) {
        return [apiProxy POST:URLString parameters:parameters resultClass:resultClass];
    }

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

- (BFTask *)POST:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    id<CUTEAPIProxyProtocol> apiProxy = [self getAPIProxyWithURLString:URLString];
    if (apiProxy != nil) {
        return [apiProxy POST:URLString parameters:parameters resultClass:resultClass resultKeyPath:keyPath];
    }

    [_backingManager POST:URLString parameters:parameters resultClass:resultClass resultKeyPath:keyPath completion:
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

- (BFTask *)downloadImage:(NSString *)URLString {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    [_imageDownloader setImageWithURLRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:URLString]] placeholderImage:nil success:^(NSURLRequest *request, NSHTTPURLResponse *response, UIImage *image) {
        [tcs setResult:image];
    } failure:^(NSURLRequest *request, NSHTTPURLResponse *response, NSError *error) {
        [tcs setError:error];
    }];
    return tcs.task;

}


@end
