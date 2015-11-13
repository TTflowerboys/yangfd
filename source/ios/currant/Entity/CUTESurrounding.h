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

@interface CUTESurrounding : MTLModel <MTLJSONSerializing>

@property (strong, nonatomic) NSString *identifier;

@property (strong, nonatomic) NSString *name;

@property (strong, nonatomic) NSString *zipcode;

@property (strong, nonatomic) NSString *postcode; //TODO tmp use , need remove

@property (nonatomic, strong) NSNumber *latitude;

@property (nonatomic, strong) NSNumber *longitude;

@property (nonatomic, readonly) NSString *address;

@property (strong, nonatomic) CUTEEnum *type;

@property (strong, nonatomic) NSArray<CUTETrafficTime *> *trafficTimes;

- (NSDictionary *)toParams;

@end
