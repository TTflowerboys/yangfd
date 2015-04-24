//
//  CUTERentShareForm.m
//  currant
//
//  Created by Foster Yin on 4/22/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentShareForm.h"
#import "CUTECommonMacro.h"

@implementation CUTERentShareForm

- (NSArray *)fields {
    return @[@{FXFormFieldKey: @"view", FXFormFieldTitle: STR(@"查看我的房产")},
             @{FXFormFieldKey: @"copyLink", FXFormFieldTitle: STR(@"复制页面链接"), FXFormFieldHeader: STR(@"分享")},
             @{FXFormFieldKey: @"qrcode", FXFormFieldTitle: STR(@"二维码")},
             @{FXFormFieldKey: @"wechat", FXFormFieldTitle: STR(@"分享到微信")},];
}

@end
