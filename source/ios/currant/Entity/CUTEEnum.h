//
//  CUTEEnum.h
//  currant
//
//  Created by Foster Yin on 4/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Mantle.h>

@interface CUTEEnum : MTLModel <MTLJSONSerializing>

@property (nonnull, strong, nonatomic) NSString *identifier;

@property (nullable, strong, nonatomic) NSString *slug;

@property (nullable, strong, nonatomic) NSString *status;

@property (nonatomic) NSTimeInterval time;

@property (nullable, strong, nonatomic) NSString *type;

@property (nonnull, strong, nonatomic) NSString *value;

@property (nonatomic) NSInteger sortValue;

@property (nullable, strong, nonatomic) NSString *image;


@end
