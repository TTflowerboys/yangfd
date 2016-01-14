//
//  CUTEArea.h
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Mantle.h>

@interface CUTEArea : MTLModel <MTLJSONSerializing>

@property (nullable, strong, nonatomic) NSString *unit;

@property (nullable, strong, nonatomic) NSString *value;

+ (CUTEArea * __nonnull)areaWithValue:(NSString * __nonnull)value unit:(NSString * __nonnull)unit;

- (NSString * __nonnull)unitPresentation;

- (NSDictionary * __nonnull)toParams;

@end
