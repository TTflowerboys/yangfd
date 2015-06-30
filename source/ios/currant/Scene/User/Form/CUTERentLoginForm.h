//
//  CUTELoginForm.h
//  currant
//
//  Created by Foster Yin on 4/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEForm.h"
#import "CUTEEnum.h"
#import "CUTECountry.h"

@interface CUTERentLoginForm : CUTEForm

@property (strong, nonatomic) CUTECountry *country;

@property (strong, nonatomic) NSString *phone;

@property (strong, nonatomic) NSString *password;

@property (nonatomic) BOOL isOnlyRegister;

- (void)setAllCountries:(NSArray *)allCountries;

- (NSError *)validateFormWithScenario:(NSString *)scenario;

@end
