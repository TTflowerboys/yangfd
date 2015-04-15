//
//  CUTEPropertyInfoForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTEForm.h"
#import "CUTEPropertyMoreInfoForm.h"
#import "CUTERentPriceForm.h"
#import "CUTERentContactForm.h"
#import "CUTEEnum.h"
#import "CUTEAreaForm.h"
#import "CUTEProperty.h"

@interface CUTEPropertyInfoForm : CUTEForm

@property (nonatomic, strong) NSArray *photos;
@property (nonatomic, strong) CUTEEnum *propertyType;
@property (nonatomic, assign) NSUInteger bedroom;
@property (nonatomic, strong) CUTEAreaForm *area;
@property (nonatomic, strong) CUTERentPriceForm *rentPrice;
@property (nonatomic, strong) CUTEPropertyMoreInfoForm *moreInfo;
@property (strong, nonatomic) CUTERentContactForm *submit;



- (void)setAllPropertyTypes:(NSArray *)allPropertyTypes;

@end
