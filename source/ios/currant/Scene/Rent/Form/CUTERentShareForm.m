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
    return @[@{FXFormFieldKey: @"view", FXFormFieldTitle: STR(@"RentShare/查看我的房源移动主页"), FXFormFieldCell: [CUTEFormTextCell class]},
             @{FXFormFieldKey: @"edit", FXFormFieldTitle: STR(@"RentShare/编辑我的房产"), FXFormFieldCell: [CUTEFormTextCell class]},
             @{FXFormFieldKey: @"copyLink", FXFormFieldTitle: STR(@"RentShare/复制房源移动主页链接"), FXFormFieldHeader: @"", FXFormFieldCell: [CUTEFormCenterTextCell class]},
//             @{FXFormFieldKey: @"qrcode", FXFormFieldTitle: STR(@"二维码"), FXFormFieldCell: [CUTEQrcodeCell class]},
             @{FXFormFieldKey: @"wechat", FXFormFieldTitle: STR(@"RentShare/分享我的房源移动主页"), FXFormFieldCell: [CUTEFormShareButtonCell class],FXFormFieldHeader:@""}];
}

@end
