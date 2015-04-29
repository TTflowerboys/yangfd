//
//  CUTERectContactForm.h
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEForm.h"
#import "CUTEEnum.h"

@interface CUTERentContactForm : CUTEForm

@property (strong, nonatomic) NSString *name;

@property (strong, nonatomic) NSString *email;

@property (strong, nonatomic) CUTEEnum *country;

@property (strong, nonatomic) NSString *phone;

@property (strong, nonatomic) NSString *code;

- (void)setAllCountries:(NSArray *)allCountries;

- (NSError *)validateFormWithScenario:(NSString *)scenario;

@end
