//
//  CUTERentAddressEditForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <FXForms.h>
#import "CUTEPropertyInfoForm.h"

@interface CUTERentAddressEditForm : NSObject <FXForm>

@property (strong, nonatomic) NSString *street;
@property (strong, nonatomic) NSString *building;
@property (strong, nonatomic) NSString *city;
@property (strong, nonatomic) NSString *state;
@property (strong, nonatomic) NSString *postCode;
@property (strong, nonatomic) NSString *country;

@end
