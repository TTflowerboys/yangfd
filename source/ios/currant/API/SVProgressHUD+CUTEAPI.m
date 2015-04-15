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
                       @(40000):STR(@"参数不正确"),
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
    else {
        [SVProgressHUD showErrorWithStatus:error.userInfo[NSLocalizedDescriptionKey]];
    }
}

@end
