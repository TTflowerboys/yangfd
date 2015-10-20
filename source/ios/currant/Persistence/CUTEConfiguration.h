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

+ (NSString *)secureHost;

+ (NSURL *)hostURL;

+ (NSURL *)uploadHostURL;

+ (NSString *)yangfdScheme;

+ (NSString *)ukServicePhone;

+ (NSString *)servicePhone;

+ (NSString *)apiEndpoint;

+ (NSString *)appStoreId;

+ (NSString *)googleAPIKey;

+ (NSString *)weixinAPPId;

+ (NSString *)sinaAppKey;

+ (NSString *)umengAppKey;

+ (NSString *)umengCallbackURLString;

+ (NSString *) appVersion;

+ (NSString *) versionBuild;

+ (BOOL)enableMultipleLanguage;

@end
