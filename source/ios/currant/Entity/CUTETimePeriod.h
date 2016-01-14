//
//  CUTETimePeriod.h
//  currant
//
//  Created by Foster Yin on 6/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <MTLModel.h>
#import <MTLJSONAdapter.h>

@interface CUTETimePeriod : MTLModel <MTLJSONSerializing>

@property (nullable, strong, nonatomic) NSString *unit;

@property (nonatomic) int value;

@property (nonnull, nonatomic, readonly) NSString *unitForDisplay;


/// - parameter value: time value
/// - parameter unit: time unit, available in year, month, week, day, hour, minute, second
/// - returns: CUTETimePeriod
+ (CUTETimePeriod * __nonnull)timePeriodWithValue:(int)value unit:(NSString * __nonnull)unit;

+ (NSString * __nullable)getDisplayUnitWithUnit:(NSString *__nonnull)unit;

- (NSDictionary * __nonnull)toParams;

@end
