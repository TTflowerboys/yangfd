//
//  CUTECurrency.h
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <MTLModel.h>
#import <MTLJSONAdapter.h>

@interface CUTECurrency : MTLModel <MTLJSONSerializing>

@property (nullable, strong, nonatomic) NSString *unit;

@property (nullable, nonatomic) NSString *value;

@property (nonnull, nonatomic, readonly) NSString *symbol;

+ (CUTECurrency * __nonnull)currencyWithValue:(NSString *__nonnull)value unit:(NSString *__nonnull)unit;

- (NSDictionary * __nonnull)toParams;

+ (NSString * __nullable)symbolOfCurrencyUnit:(NSString * __nonnull)currency;

+ (NSArray * __nonnull)currencyUnitArray;

+ (NSString * __nonnull)defaultCurrencyUnit;

@end
