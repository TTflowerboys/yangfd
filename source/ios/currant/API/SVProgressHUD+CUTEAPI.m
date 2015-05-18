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

static NSDictionary *messageDicionary = nil;

+ (NSString *)apiErrorMessageFromCode:(NSInteger)code {
    if (!messageDicionary) {
        messageDicionary = @{
                             @(40000): STR(@"输入错误，请检查后重试。"),
                             @(40090): STR(@"已经在收藏里了。"),
                             @(40100): STR(@"没有访问权限，请登陆后重试。"),
                             @(40101): STR(@"频率达到上限，请稍后重试。"),
                             @(40103): STR(@"账户或密码错误。"),
                             @(40105): STR(@"对不起，您的权限不够。"),
                             @(40106): STR(@"对不起，不能操作他人的订单。"),
                             @(40107): STR(@"对不起，不能查看他人的订单。"),
                             @(40109): STR(@"没有权限！"),
                             @(40324): STR(@"账户不存在！"),
                             @(40325): STR(@"邮箱已被使用！"),
                             @(40351): STR(@"电话已被使用！"),
                             @(40357): STR(@"验证失败。"),
                             @(40399): STR(@"权限错误。"),
                             @(40400): STR(@"对不起，没有找到您要的资源！"),
                             @(50000): STR(@"服务暂时不可用，请稍后重试。"),
                             @(50200): STR(@"服务暂时不可用，请稍后重试。"),
                             @(50300): STR(@"第三方服务暂时不可用，请稍后重试。"),
                             @(50400): STR(@"服务暂时不可用，请稍后重试。")
                             };
    }

    NSString *ret = messageDicionary[@(code)];
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

+ (void)showErrorWithException:(NSException *)exception {
    [SVProgressHUD showErrorWithStatus:exception.userInfo[NSLocalizedDescriptionKey]];
}

+ (void)showErrorWithCancellation {
    [SVProgressHUD showErrorWithStatus:STR(@"请求被取消")];
}

@end
