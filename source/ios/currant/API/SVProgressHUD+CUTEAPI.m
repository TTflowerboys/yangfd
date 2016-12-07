//
//  SVProgressHUD+CUTEAPI.m
//  currant
//
//  Created by Foster Yin on 4/15/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "SVProgressHUD+CUTEAPI.h"
#import "CUTECommonMacro.h"
#import "Bolts.h"

@implementation SVProgressHUD (CUTEAPI)

static NSDictionary *messageDicionary = nil;

+ (NSString *)apiErrorMessageFromCode:(NSInteger)code {
    if (!messageDicionary) {
        messageDicionary = @{
                             @(40000): STR(@"API/输入错误，请检查后重试。"),
                             @(40090): STR(@"API/已经在收藏里了。"),
                             @(40100): STR(@"API/没有访问权限，请登陆后重试。"),
                             @(40101): STR(@"API/频率达到上限，请稍后重试。"),
                             @(40103): STR(@"API/账户或密码错误。"),
                             @(40105): STR(@"API/对不起，您的权限不够。"),
                             @(40106): STR(@"API/对不起，不能操作他人的订单。"),
                             @(40107): STR(@"API/对不起，不能查看他人的订单。"),
                             @(40109): STR(@"API/没有权限！"),
                             @(40324): STR(@"API/账户不存在！"),
                             @(40325): STR(@"API/邮箱已被使用！"),
                             @(40351): STR(@"API/电话已被使用！"),
                             @(40352): STR(@"API/请求太频繁！"),
                             @(40357): STR(@"API/验证失败。"),
                             @(40358): STR(@"API/验证码无效。"),
                             @(40359): STR(@"API/验证码失效，已经使用过？"),
                             @(40360): STR(@"API/邀请码无效。"),
                             @(40361): STR(@"API/邀请码已被使用。"),
                             @(40399): STR(@"API/权限错误。"),
                             @(40400): STR(@"API/对不起，没有找到您要的资源！"),
                             @(50000): STR(@"API/服务暂时不可用，请稍后重试。"),
                             @(50200): STR(@"API/服务暂时不可用，请稍后重试。"),
                             @(50300): STR(@"API/第三方服务暂时不可用，请稍后重试。"),
                             @(50400): STR(@"API/服务暂时不可用，请稍后重试。")
                             };
    }

    NSString *ret = messageDicionary[@(code)];
    if (!ret) {
        ret = STR(@"API/请求失败");
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
    else if (error && [error.domain isEqualToString:@"bolts"]) {
         NSArray *errors = error.userInfo[@"errors"];
        if (error.code == kBFMultipleErrorsError && !IsArrayNilOrEmpty(errors)) {
            [SVProgressHUD showErrorWithStatus:[[(NSError *)errors.firstObject userInfo] objectForKey:NSLocalizedDescriptionKey]];
        }
        else {
            [SVProgressHUD showErrorWithStatus:error.userInfo[NSLocalizedDescriptionKey]];
        }
    }
    else if (error && [error.domain isEqualToString:NSURLErrorDomain]) {
        if (error.code == NSURLErrorCancelled) {
            [SVProgressHUD showErrorWithStatus:STR(@"API/请求被取消")];
        }
    }
    else {
        [SVProgressHUD showErrorWithStatus:error.userInfo[NSLocalizedDescriptionKey]];
    }
}

+ (void)showErrorWithException:(NSException *)exception {
    [SVProgressHUD showErrorWithStatus:exception.userInfo[NSLocalizedDescriptionKey]];
}

+ (void)showErrorWithCancellation {
    [SVProgressHUD showErrorWithStatus:STR(@"API/请求被取消")];
}

@end
