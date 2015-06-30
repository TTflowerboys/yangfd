//
//  CUTERentContactSettingForm.h
//  currant
//
//  Created by Foster Yin on 6/12/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEForm.h"

@interface CUTERentContactDisplaySettingForm : CUTEForm

@property (nonatomic) BOOL displayPhone;

@property (nonatomic) BOOL displayEmail;

@property (strong, nonatomic) NSString *wechat;

@property (nonatomic) BOOL singleUseForReedit;

@end
