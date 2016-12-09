//
//  CUTEAPIManager.m
//  currant
//
//  Created by Foster Yin on 4/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEAPIManager.h"
#import <NSArray+ObjectiveSugar.h>
#import <RegExCategories.h>
#import <Mantle.h>
#import <NSDictionary+MTLJSONKeyPath.h>
#import "CUTEConfiguration.h"
#import "CUTECommonMacro.h"
#import "CUTEUserAgentUtil.h"


@interface CUTEAPIManager () {

    NSURL *_baseURL;

    NSURLSession *_backingManager;

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

        NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
        configuration.HTTPAdditionalHeaders = @{@"Accept": @"application/json",
                                                @"Accept-Encoding": @"gzip",
                                                @"User-Agent": [CUTEUserAgentUtil userAgent],
                                                @"Content-Type": @"application/json"
                                                };

        _backingManager = [NSURLSession sessionWithConfiguration:configuration];
        _baseURL = [NSURL URLWithString:[CUTEConfiguration apiEndpoint]];
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
    return _baseURL;
}

- (NSURLRequest *)requestWithMethod:(NSString *)method URLString:(NSString *)URLString parameters:(NSDictionary *)parameters error:(NSError *__autoreleasing *)error {
    NSMutableURLRequest *mutableRequest = [[NSMutableURLRequest alloc] initWithURL:[NSURL URLWithString:URLString relativeToURL:[self baseURL]]];
    mutableRequest.HTTPMethod = method;
    if (parameters) {
        if (![mutableRequest valueForHTTPHeaderField:@"Content-Type"]) {
            [mutableRequest setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
        }

        [mutableRequest setHTTPBody:[NSJSONSerialization dataWithJSONObject:parameters options:0 error:error]];
    }
    return mutableRequest;

//    return [[_backingManager requestSerializer] requestWithMethod:method URLString:URLString parameters:parameters error:error];
}

- (void)setMaxConcurrentOperationCount:(NSInteger)count {
    _backingManager.delegateQueue.maxConcurrentOperationCount = count;
    //_backingManager.operationQueue.maxConcurrentOperationCount = count;
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

- (NSObject *)getObjecWithJSON:(NSObject *)jsonObject resultKeyPath:(NSString *)keyPath {
    if (jsonObject != nil) {
        NSError *error = nil;
        if (keyPath && [keyPath length] && [jsonObject isKindOfClass:[NSDictionary class]]) {
            BOOL success = NO;
            jsonObject = [(NSDictionary *)jsonObject mtl_valueForJSONKeyPath:keyPath success:&success error:&error];
            if (!success) {
                return nil;
            }
        }        
        return jsonObject;
    }
    return nil;
}

- (id)getTransformedObjectWithJSON:(NSObject *)jsonObject resultClass:(Class)resultClass {
    if (jsonObject != nil) {
        NSError *error = nil;
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

    NSURLRequest *request = [self requestWithMethod:method URLString:URLString parameters:parameters error:nil];


    NSURLSessionDataTask *dataTask = [_backingManager dataTaskWithRequest:request completionHandler:
                                      ^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
                                          //trySetCancelled will cancel this request
                                          if (tcs.task.isCancelled) {
                                              return;
                                          }

                                          if (error) {
                                              [tcs setError:error];
                                          }
                                          else {
                                              NSError *jsonError = nil;
                                              id responseObject = [NSJSONSerialization JSONObjectWithData:data options:0 error:&jsonError];
                                              if (jsonError) {
                                                  [tcs setError:jsonError];
                                              }
                                              else {
                                                  if ([responseObject isKindOfClass:[NSDictionary class]]) {
                                                      if ([responseObject[@"ret"] intValue] == 0) {//Response OK
                                                          id object = [self getObjecWithJSON:responseObject resultKeyPath:keyPath];
                                                          id transformedObject = [self getTransformedObjectWithJSON:object resultClass:resultClass];
                                                          [tcs setResult:@{@"json": object, @"model": transformedObject}];
                                                      }
                                                      else { //Response Error
                                                          return [tcs setError:[NSError errorWithDomain:@"BBTAPIDomain" code:[responseObject[@"ret"] intValue] userInfo:[responseObject copy]]];
                                                      }
                                                  }
                                                  else {
                                                      return [tcs setError:[NSError errorWithDomain:@"BBTAPIDomain" code:-1 userInfo:nil]];
                                                  }
                                              }
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

    return [[self forwardMethod:method URLString:URLString parameters:parameters resultClass:resultClass resultKeyPath:keyPath cancellationToken:cancellationToken] continueWithBlock:^id _Nullable(BFTask * _Nonnull task) {

        if (task.result && [task.result count] == 2) {
            id transformedObject = task.result[@"model"];
            if (transformedObject) {
                return [BFTask taskWithResult:transformedObject];
            }
            else {
                return [BFTask taskWithResult:nil];
            }
        }

        return task;
    }];
}



@end
