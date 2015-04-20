//
//  CUTERentPriceForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTEForm.h"
#import "CUTEEnum.h"
#import "CUTERentPeriod.h"

@interface CUTERentPriceForm : CUTEForm

@property (strong, nonatomic) NSString *currency;
@property (strong, nonatomic) CUTEEnum *depositType;
@property (nonatomic) float rentPrice;
@property (nonatomic) BOOL containBill;
@property (nonatomic) BOOL needSetPeriod;
@property (strong, nonatomic) NSDate *rentAvailableTime;
@property (strong, nonatomic) CUTERentPeriod *rentPeriod;


- (NSString *)currencySymbol;

- (void)setAllDepositTypes:(NSArray *)depositTypes;

- (void)setAllRentPeriods:(NSArray *)rentPeriods;

@end
