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

@property (strong, nonatomic) NSString *identifier;

@property (strong, nonatomic) NSString *slug;

@property (strong, nonatomic) NSString *status;

@property (nonatomic) NSTimeInterval time;

@property (strong, nonatomic) NSString *type;

@property (strong, nonatomic) NSString *value;

@property (nonatomic) NSInteger sortValue;

@end
