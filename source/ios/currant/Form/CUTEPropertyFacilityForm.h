//
//  CUTEPropertyFacilityForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <FXForms.h>

@interface CUTEPropertyFacilityForm : NSObject <FXForm>

@property (nonatomic) BOOL television;
@property (nonatomic) BOOL toaster;
@property (nonatomic) BOOL washingMachine;
@property (nonatomic) BOOL firePlace;
@property (nonatomic) BOOL parkingSpace;
@property (nonatomic) BOOL pool;
@property (nonatomic) BOOL basketballCourt;

@end
