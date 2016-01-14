//
//  CUTEPostcodePlace.h
//  currant
//
//  Created by Foster Yin on 7/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <MTLModel.h>
#import <MTLJSONAdapter.h>

@interface CUTEPostcodePlace : MTLModel <MTLJSONSerializing>

@property (nullable, strong, nonatomic) NSString *identifier;

@property (nullable, strong, nonatomic) NSString *placeName;

@property (nullable, strong, nonatomic) NSString *postcode;

@property (nullable, strong, nonatomic) NSString *postcodeIndex;

@property (nullable, strong, nonatomic) NSNumber *latitude;

@property (nullable, strong, nonatomic) NSNumber *longitude;

@property (nullable, strong, nonatomic) NSArray *neighborhoods;

@end
