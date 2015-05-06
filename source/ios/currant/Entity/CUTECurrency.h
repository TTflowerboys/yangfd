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

@property (strong, nonatomic) NSString *unit;

@property (nonatomic) float value;

+ (CUTECurrency *)currencyWithValue:(float)value unit:(NSString *)unit;

- (NSDictionary *)toParams;

+ (NSString *)symbolOfCurrencyUnit:(NSString *)currency;

+ (NSArray *)currencyUnitArray;

+ (NSString *)defaultCurrencyUnit;

@end
