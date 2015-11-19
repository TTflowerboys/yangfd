//
//  CUTETicketEditingListener.h
//  currant
//
//  Created by Foster Yin on 6/11/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEModelEditingListener.h"
#import "CUTEPropertyEditingListener.h"

@interface CUTETicketEditingListener : CUTEModelEditingListener

@property (nonatomic, readonly) CUTEPropertyEditingListener *propertyListener;


@end
