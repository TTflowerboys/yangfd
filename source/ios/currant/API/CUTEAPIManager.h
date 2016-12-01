//
//  CUTEAPIManager.h
//  currant
//
//  Created by Foster Yin on 4/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Bolts.h>

@class CUTEAPIManager;

@protocol CUTEAPIProxyProtocol <NSObject>

@property (nonatomic, assign) CUTEAPIManager *apiManager;

- (BFTask *)method:(NSString *)method URLString:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath cancellationToken:(BFCancellationToken *)cancellationToken;

@end


@interface CUTEAPIManager : NSObject

+ (instancetype)sharedInstance;

- (NSURL *)baseURL;

- (NSURLRequest *)requestWithMethod:(NSString *)method URLString:(NSString *)URLString parameters:(NSDictionary *)parameters error:(NSError *__autoreleasing *)error;

- (void)setMaxConcurrentOperationCount:(NSInteger)count;

- (BFTask *)GET:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass;

- (BFTask *)GET:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath;

- (BFTask *)POST:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass;

- (BFTask *)POST:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath;

- (BFTask *)GET:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass cancellationToken:(BFCancellationToken *)cancellationToken;

- (BFTask *)GET:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath  cancellationToken:(BFCancellationToken *)cancellationToken;

- (BFTask *)POST:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass cancellationToken:(BFCancellationToken *)cancellationToken;

- (BFTask *)POST:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath cancellationToken:(BFCancellationToken *)cancellationToken;

- (BFTask *)method:(NSString *)method URLString:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath cancellationToken:(BFCancellationToken *)cancellationToken;

- (BFTask *)forwardMethod:(NSString *)method URLString:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass resultKeyPath:(NSString *)keyPath cancellationToken:(BFCancellationToken *)cancellationToken;

- (BFTask *)downloadImage:(NSString *)URLString;

@end
