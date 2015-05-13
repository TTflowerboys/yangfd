//
//  CUTEAPIManager.h
//  currant
//
//  Created by Foster Yin on 4/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Bolts.h>

@interface CUTEAPIManager : NSObject

+ (instancetype)sharedInstance;

- (BFTask *)GET:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass;

- (BFTask *)POST:(NSString *)URLString parameters:(NSDictionary *)parameters resultClass:(Class)resultClass;

- (BFTask *)downloadImage:(NSString *)URLString;

@end
