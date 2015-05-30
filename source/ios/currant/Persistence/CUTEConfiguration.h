//
//  CUTEConfiguration.h
//  currant
//
//  Created by Foster Yin on 3/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface CUTEConfiguration : NSObject

+ (NSString *)host;

+ (NSURL *)hostURL;

+ (NSURL *)uploadHostURL;

+ (NSString *)yangfdScheme;

+ (NSString *)ukServicePhone;

+ (NSString *)servicePhone;

+ (NSString *)apiEndpoint;

+ (NSString *)googleAPIKey;

+ (NSString *)weixinAPPId;

+ (NSString *)gaTrackingId;

@end
