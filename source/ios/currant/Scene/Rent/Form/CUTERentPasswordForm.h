//
//  CUTERentPasswordForm.h
//  currant
//
//  Created by Foster Yin on 5/18/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEForm.h"
#import "CUTEEnum.h"

@interface CUTERentPasswordForm : CUTEForm

@property (strong, nonatomic) CUTEEnum *country;

@property (strong, nonatomic) NSString *phone;

@property (strong, nonatomic) NSString *code;

@property (strong, nonatomic) NSString *password;

@property (strong, nonatomic) NSString *confirmPassword;

- (void)setAllCountries:(NSArray *)allCountries;

- (NSError *)validateFormWithScenario:(NSString *)scenario;

@end
