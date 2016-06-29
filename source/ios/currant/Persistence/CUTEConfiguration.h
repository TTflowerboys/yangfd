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

+ (BOOL)enableAPNS;

+ (BOOL)enableFabric;

+ (BOOL)enableBugtags;

@end
