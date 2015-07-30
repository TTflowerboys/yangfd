//
//  CUTERentConfirmPhoneForm.h
//  currant
//
//  Created by Foster Yin on 7/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEForm.h"
#import "CUTECountry.h"
#import "CUTEUser.h"

@interface CUTERentConfirmPhoneForm : CUTEForm

@property (strong, nonatomic) CUTECountry *country;

@property (strong, nonatomic) NSString *phone;

@property (strong, nonatomic) CUTEUser *user;

- (void)setAllCountries:(NSArray *)allCountries;

@end
