//
//  SVProgressHUD+CUTEAPI.m
//  currant
//
//  Created by Foster Yin on 4/15/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "SVProgressHUD+CUTEAPI.h"
#import "CUTECommonMacro.h"

@implementation SVProgressHUD (CUTEAPI)

+ (NSString *)apiErrorMessageFromCode:(NSInteger)code {
    NSString *ret = @{
                      @(40000): STR(@"invalid argument"),
                      @(40087): STR(@"background process are still processing the property, try again later"),
                      @(40088): STR(@"Failed to get walkscore"),
                      @(40089): STR(@"Invalid image source: not from existing property or news"),
                      @(40090): STR(@"Invalid operation: This property has already been added to your favorites."),
                      @(40091): STR(@"Invalid params: role"),
                      @(40092): STR(@"Invalid params: property_type"),
                      @(40093): STR(@"Invalid params: status"),
                      @(40094): STR(@"Invalid admin: email not provided."),
                      @(40095): STR(@"Invalid params: intention"),
                      @(40096): STR(@"Invalid params: gender"),
                      @(40097): STR(@"Invalid params: old_password not needed"),
                      @(40098): STR(@"Invalid params: current password not provided"),
                      @(40099): STR(@"Invalid params: No ‘@’ in email address supplied:"),
                      @(40100): STR(@"not authorized"),
                      @(40101): STR(@"rate limit exceeded"),
                      @(40103): STR(@"login/password error"),
                      @(40105): STR(@"no admin access or insufficient admin level"),
                      @(40106): STR(@"could not operate on other’s order"),
                      @(40107): STR(@"no permission to view this order"),
                      @(40108): STR(@"order validation failed"),
                      @(40109): STR(@"required information not present"),
                      @(40110): STR(@"unpaid order"),
                      @(40111): STR(@"expired or canceled order"),
                      @(40112): STR(@"order not yet valid"),
                      @(40300): STR(@"illegal operation"),
                      @(40301): STR(@"no ad in given channel"),
                      @(40302): STR(@"non-exist blog post"),
                      @(40314): STR(@"non-exist message"),
                      @(40324): STR(@"non-exist user"),
                      @(40325): STR(@"email already in use"),
                      @(40326): STR(@"role already exists"),
                      @(40327): STR(@"role does not exist"),
                      @(40328): STR(@"tag already exists"),
                      @(40329): STR(@"tag does not exist"),
                      @(40331): STR(@"admin user already in the shop"),
                      @(40332): STR(@"admin user not in the shop"),
                      @(40334): STR(@"shop does not exist"),
                      @(40337): STR(@"shop item sold out"),
                      @(40338): STR(@"invalid order to cancel"),
                      @(40339): STR(@"invalid order to pay"),
                      @(40340): STR(@"invalid order secret"),
                      @(40344): STR(@"order not found"),
                      @(40345): STR(@"order could only hold items of same shop"),
                      @(40346): STR(@"special items do not support combined order"),
                      @(40347): STR(@"shop not open"),
                      @(40351): STR(@"phone already in use"),
                      @(40352): STR(@"request too frequently"),
                      @(40353): STR(@"feedback not exist"),
                      @(40354): STR(@"credit not enough"),
                      @(40356): STR(@"slug already in use"),
                      @(40357): STR(@"captcha validation failed"),
                      @(40398): STR(@"Permission denied: not a valid property_id"),
                      @(40399): STR(@"Permission denied"),
                      @(40400): STR(@"resource not found"),
                      @(40501): STR(@"use https and try again"),
                      @(50000): STR(@"server died"),
                      @(50300): STR(@"external service error"),
                      @(50308): STR(@"clickatell unknown error"),
                      @(50314): STR(@"recaptcha error"),
                      @(50315): STR(@"opencaptcha error"),
                      @(50317): STR(@"qiniu error"),
                      @(50318): STR(@"wechat error"),
                      }[@(code)];
    if (!ret) {
        ret = STR(@"请求失败");
    }
    return ret;
}

+ (void)showErrorWithError:(NSError *)error {
    if (error && [error.domain isEqualToString:@"BBTAPIDomain"]) {
        [SVProgressHUD showErrorWithStatus:[SVProgressHUD apiErrorMessageFromCode:error.code]];
    }
    else if (error && [error.domain isEqualToString:@"com.ngr.validator.domain"]) {
        [SVProgressHUD showErrorWithStatus:STR(error.localizedDescription)];
    }
    else {
        [SVProgressHUD showErrorWithStatus:error.userInfo[NSLocalizedDescriptionKey]];
    }
}

@end
