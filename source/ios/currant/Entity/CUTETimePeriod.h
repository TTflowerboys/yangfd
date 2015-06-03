//
//  CUTETimePeriod.h
//  currant
//
//  Created by Foster Yin on 6/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "MTLModel.h"
#import "MTLJSONAdapter.h"

@interface CUTETimePeriod : MTLModel <MTLJSONSerializing>

@property (strong, nonatomic) NSString *unit;

@property (nonatomic) int value;

@property (nonatomic, readonly) NSString *unitForDisplay;

+ (CUTETimePeriod *)timePeriodWithValue:(float)value unit:(NSString *)unit;

+ (NSString *)getDisplayUnitWithUnit:(NSString *)unit;

- (NSDictionary *)toParams;

@end
