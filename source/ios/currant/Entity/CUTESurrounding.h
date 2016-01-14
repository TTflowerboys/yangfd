//
//  CUTESurrounding.h
//  currant
//
//  Created by Foster Yin on 11/10/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "MTLModel.h"
#import <MTLJSONAdapter.h>
#import "CUTEEnum.h"
#import "CUTETrafficTime.h"
#import "CUTEModelEditingListener.h"

@interface CUTESurrounding : MTLModel <MTLJSONSerializing, CUTEModelEditingListenerDelegate>

@property (nullable, strong, nonatomic) NSString *identifier;

@property (nullable, strong, nonatomic) NSString *name;

@property (nullable, strong, nonatomic) NSString *zipcode;

@property (nullable, strong, nonatomic) NSNumber *latitude;

@property (nullable, strong, nonatomic) NSNumber *longitude;

@property (nullable, nonatomic, readonly) NSString *address;

@property (nullable, strong, nonatomic) CUTEEnum *type;

@property (nullable, strong, nonatomic) NSArray<CUTETrafficTime *> *trafficTimes;

- (NSDictionary * __nonnull)toParams;

@end
