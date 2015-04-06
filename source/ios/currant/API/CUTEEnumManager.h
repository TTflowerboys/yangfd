//
//  CUTEEnumManager.h
//  currant
//
//  Created by Foster Yin on 4/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <BBTRestClient.h>

@interface CUTEEnumManager : NSObject

+ (instancetype)sharedInstance;

- (AFHTTPRequestOperation *)getEnumByType:(NSString *)type completion:(dispatch_block_t)comletion;

- (void)startLoadAllEnums;

@end
