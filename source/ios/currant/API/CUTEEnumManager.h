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

- (void)getEnumsByType:(NSString *)type completion:(void (^)(NSArray *))block;

- (void)startLoadAllEnums;

@end
