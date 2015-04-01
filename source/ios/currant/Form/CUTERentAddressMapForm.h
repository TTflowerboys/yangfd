//
//  CUTERentAddressMapForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTEForm.h"
#import "CUTERentAddressEditForm.h"
#import "CUTEPropertyInfoForm.h"
#import <MapKit/MapKit.h>

@interface CUTERentAddressMapForm : CUTEForm

@property (strong, nonatomic) CLLocation *location;

@property (strong, nonatomic) CUTERentAddressEditForm *edit;

@property (strong, nonatomic) CUTEPropertyInfoForm *propertyInfo;

@end
