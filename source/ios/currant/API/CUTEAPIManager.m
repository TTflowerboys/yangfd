//
//  CUTEAPIManager.m
//  currant
//
//  Created by Foster Yin on 4/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEAPIManager.h"
#import <AFNetworking.h>
#import <UIImageView+AFNetworking.h>
#import <NSArray+ObjectiveSugar.h>
#import <RegExCategories.h>
#import <Mantle.h>
#import <NSDictionary+MTLJSONKeyPath.h>
#import "CUTEConfiguration.h"
#import "CUTECommonMacro.h"
#import "CUTEUserAgentUtil.h"


@interface CUTEAPIManager () {

    AFHTTPSessionManager *_backingManager;

    UIImageView *_imageDownloader;

    NSMutableDictionary *_adapterURLRuleMappings;
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
        _backingManager = [[AFHTTPSessionManager alloc] initWithBaseURL:[NSURL URLWithString:[CUTEConfiguration apiEndpoint]]];
        _backingManager.requestSerializer = [AFJSONRequestSerializer new];
        [_backingManager.requestSerializer setValue:@"application/json" forHTTPHeaderField:@"Accept"];
        [_backingManager.requestSerializer setValue:@"gzip" forHTTPHeaderField:@"Accept-Encoding"];
        [_backingManager.requestSerializer setValue:[CUTEUserAgentUtil userAgent] forHTTPHeaderField:@"User-Agent"];

        _imageDownloader = [UIImageView new];

        _adapterURLRuleMappings = [NSMutableDictionary dictionary];


        //TODO add  test case for all api proxy class
        
        // 1. /api/1/property/<property_id>
        // 2. /api/1/property/search
        // 3. /api/1/property/<property_id>/edit
        // 4. /api/2/property/<property_id>/edit
        [self registerAPIProxyClassName:@"CUTEPropertyAPIProxy" withURLRule:@"/api/[1-9]+/property/*+"];

        // 1. /api/1/rent_ticket/<rent_id> result has property, so need hook
        [self registerAPIProxyClassName:@"CUTERentTicketAPIProxy" withURLRule:@"api/1/rent_ticket/*+"];
        //main_mixed_index api
        [self registerAPIProxyClassName:@"CUTEMainMixedIndexAPIProxy" withURLRule:@"/api/1/main_mixed_index/search"];
    }
    return self;
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
        adapter.apiManager = self;
        return adapter;

    }

    return nil;
}

- (NSURL *)baseURL {
    return _backingManager.baseURL;
}

- (NSURLRequest *)requestWithMethod:(NSString *)method URLString:(NSString *)URLString parameters:(NSDictionary *)parameters error:(NSError *__autoreleasing *)error {
    return [[_backingManager requestSerializer] requestWithMethod:method URLString:URLString parameters:parameters error:error];
}

- (void)setMaxConcurrentOperationCount:(NSInteger)count {
    _backingManager.operationQueue.maxConcurrentOperationCount = count;
}

- (BFTask *)GET:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass  {
    return [self method:@"GET" URLString:URLString parameters:parameters resultClass:resultClass resultKeyPath:@"val" cancellationToken:nil];
}

- (BFTask *)GET:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath {
    return [self method:@"GET" URLString:URLString parameters:parameters resultClass:resultClass resultKeyPath:keyPath cancellationToken:nil];
}

- (BFTask *)POST:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass  {
    return [self method:@"POST" URLString:URLString parameters:parameters resultClass:resultClass resultKeyPath:@"val" cancellationToken:nil];
}

- (BFTask *)POST:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath {
    return [self method:@"POST" URLString:URLString parameters:parameters resultClass:resultClass resultKeyPath:keyPath cancellationToken:nil];
}

- (BFTask *)GET:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass cancellationToken:(BFCancellationToken *)cancellationToken {
    return [self method:@"GET" URLString:URLString parameters:parameters resultClass:resultClass resultKeyPath:@"val" cancellationToken:cancellationToken];
}

- (BFTask *)GET:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath  cancellationToken:(BFCancellationToken *)cancellationToken{
    return [self method:@"GET" URLString:URLString parameters:parameters resultClass:resultClass resultKeyPath:keyPath cancellationToken:cancellationToken];
}

- (BFTask *)POST:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass cancellationToken:(BFCancellationToken *)cancellationToken {
    return [self method:@"POST" URLString:URLString parameters:parameters resultClass:resultClass resultKeyPath:@"val" cancellationToken:cancellationToken];
}

- (BFTask *)POST:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath cancellationToken:(BFCancellationToken *)cancellationToken {
    return [self method:@"POST" URLString:URLString parameters:parameters resultClass:resultClass resultKeyPath:keyPath cancellationToken:cancellationToken];
}

- (id)getTransformedObjectWithJSON:(NSObject *)jsonObject resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath {
    if (jsonObject != nil) {
        NSError *error = nil;
        if (keyPath && [keyPath length] && [jsonObject isKindOfClass:[NSDictionary class]]) {
            BOOL success = NO;
            jsonObject = [(NSDictionary *)jsonObject mtl_valueForJSONKeyPath:keyPath success:&success error:&error];
            if (!success) {
                return nil;
            }
        }

        if (resultClass != nil) {
            if ([jsonObject isKindOfClass:[NSDictionary class]]) {
                return [MTLJSONAdapter modelOfClass:resultClass fromJSONDictionary:(NSDictionary *)jsonObject error:&error];
            }
            else if ([jsonObject isKindOfClass:[NSArray class]]) {
                return [MTLJSONAdapter modelsOfClass:resultClass fromJSONArray:(NSArray *)jsonObject error:&error];
            }
        }

        return jsonObject;
    }
    return nil;
}

- (BFTask *)forwardMethod:(NSString *)method URLString:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath cancellationToken:(BFCancellationToken *)cancellationToken {

    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    NSURLRequest *request = [_backingManager.requestSerializer requestWithMethod:method URLString:[NSURL URLWithString:URLString relativeToURL:_backingManager.baseURL].absoluteString parameters:parameters error:nil];

    NSURLSessionDataTask *dataTask = [_backingManager dataTaskWithRequest:request completionHandler:^(NSURLResponse * _Nonnull response, id  _Nullable responseObject, NSError * _Nullable error) {

        //trySetCancelled will cancel this request
        if (tcs.task.isCancelled) {
            return;
        }

        if (error) {
            [tcs setError:error];
        }
        else {
            id transformedObject = [self getTransformedObjectWithJSON:responseObject resultClass:resultClass resultKeyPath:keyPath];
            [tcs setResult:@[responseObject? responseObject: [NSNull null], transformedObject? transformedObject: [NSNull null]]];
        }

    }];

    if (cancellationToken) {
        [cancellationToken registerCancellationObserverWithBlock:^{
            [dataTask cancel];
            [tcs trySetCancelled];
        }];
    }

    [dataTask resume];

    return tcs.task;
}

- (BFTask *)method:(NSString *)method URLString:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath cancellationToken:(BFCancellationToken *)cancellationToken {

    id<CUTEAPIProxyProtocol> apiProxy = [self getAPIProxyWithURLString:URLString];
    if (apiProxy != nil) {
        return [apiProxy method:method URLString:URLString parameters:parameters resultClass:resultClass resultKeyPath:keyPath cancellationToken:cancellationToken];
    }


    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    NSURLRequest *request = [_backingManager.requestSerializer requestWithMethod:method URLString:[NSURL URLWithString:URLString relativeToURL:_backingManager.baseURL].absoluteString parameters:parameters error:nil];

    NSURLSessionDataTask *dataTask = [_backingManager dataTaskWithRequest:request completionHandler:^(NSURLResponse * _Nonnull response, id  _Nullable responseObject, NSError * _Nullable error) {

        //trySetCancelled will cancel this request
        if (tcs.task.isCancelled) {
            return;
        }

        if (error) {
            [tcs setError:error];
        }
        else {
            id transformedObject = [self getTransformedObjectWithJSON:responseObject resultClass:resultClass resultKeyPath:keyPath];
            [tcs setResult:transformedObject];
        }
    }];

    if (cancellationToken) {
        [cancellationToken registerCancellationObserverWithBlock:^{
            [dataTask cancel];
            [tcs trySetCancelled];
        }];
    }
    
    [dataTask resume];
    
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
