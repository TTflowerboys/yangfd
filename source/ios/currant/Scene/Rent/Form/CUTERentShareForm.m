//
//  CUTERentShareForm.m
//  currant
//
//  Created by Foster Yin on 4/22/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentShareForm.h"
#import "CUTECommonMacro.h"
#import "CUTEQrcodeCell.h"
#import "CUTEFormShareButtonCell.h"
#import "CUTEFormTextCell.h"
#import "CUTEFormCenterTextCell.h"

@implementation CUTERentShareForm

- (NSArray *)fields {
    return @[@{FXFormFieldKey: @"view", FXFormFieldTitle: STR(@"查看我的房产"), FXFormFieldCell: [CUTEFormTextCell class]},
             @{FXFormFieldKey: @"copyLink", FXFormFieldTitle: STR(@"复制页面链接"), FXFormFieldHeader: STR(@"分享"), FXFormFieldCell: [CUTEFormCenterTextCell class]},
             @{FXFormFieldKey: @"qrcode", FXFormFieldTitle: STR(@"二维码"), FXFormFieldCell: [CUTEQrcodeCell class]},
             @{FXFormFieldKey: @"wechat", FXFormFieldTitle: STR(@"分享到微信"), FXFormFieldCell: [CUTEFormShareButtonCell class]},];
}

@end
