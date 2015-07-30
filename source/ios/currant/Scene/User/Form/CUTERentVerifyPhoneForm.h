//
//  CUTERentVerifyPhoneForm.h
//  currant
//
//  Created by Foster Yin on 7/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEForm.h"
#import "CUTEUser.h"

@interface CUTERentVerifyPhoneForm : CUTEForm

@property (strong, nonatomic) NSString *code;

@property (strong, nonatomic) CUTEUser *user;

@end
