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

@property (strong, nonatomic) NSString *identifier;

@property (strong, nonatomic) NSString *placeName;

@property (strong, nonatomic) NSString *postcode;

@property (strong, nonatomic) NSString *postcodeIndex;

@property (nonatomic, strong) NSNumber *latitude;

@property (nonatomic, strong) NSNumber *longitude;

@property (strong, nonatomic) NSArray *neighborhoods;

@end
